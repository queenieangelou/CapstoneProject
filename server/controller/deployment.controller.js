import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Deployment from '../mongodb/models/deployment.js';
import User from '../mongodb/models/user.js';
import Part from '../mongodb/models/part.js';

dotenv.config();

const getAllDeployments = async (req, res) => {
  const {
    _end, _order, _start, _sort, supplierName_like = '',
  } = req.query;

  const query = {};

  if (supplierName_like) {
    query.supplierName = { $regex: supplierName_like, $options: 'i' };
  }

  try {
    const count = await Deployment.countDocuments(query);

    const deployments = await Deployment
      .find(query)
      .limit(parseInt(_end) - parseInt(_start))
      .skip(parseInt(_start))
      .sort({ [_sort]: _order })
      .populate('part', 'partName brandName');

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');

    res.status(200).json(deployments);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Fetching deployments failed, please try again later' });
  }
};

const getDeploymentDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const deploymentExists = await Deployment.findOne({ _id: id })
      .populate('creator')
      .populate('part')
      .session(session);

    if (deploymentExists) {
      const response = {
        ...deploymentExists.toObject(),
        partName: deploymentExists.part ? deploymentExists.part.partName : null,
        brandName: deploymentExists.part ? deploymentExists.part.brandName : null,
      };
      res.status(200).json(response);
    } else {
      res.status(404).json({ message: 'Deployment does not exist' });
    }
  } catch (err) {
    console.error('Error fetching deployment detail:', err);
    res.status(500).json({ message: 'Failed to get the deployment details, please try again later' });
  } finally {
    session.endSession();
  }
};

const createDeployment = async (req, res) => {
  const { 
    email,
    seq, 
    date, 
    clientName, 
    vehicleModel, 
    arrivalDate,
    part, // This is coming in "partName|brandName" format
    quantityUsed,
    deploymentStatus,
    deploymentDate,
    releaseStatus,
    releaseDate
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Split the part string into partName and brandName
    const [partName, brandName] = part.split('|');
    
    if (!partName || !brandName) {
      throw new Error('Invalid part format. Expected "partName|brandName"');
    }

    // Find part using partName and brandName
    const selectedPart = await Part.findOne({
      partName: partName,
      brandName: brandName
    }).session(session);

    if (!selectedPart) {
      throw new Error(`Part with name "${partName}" and brand "${brandName}" not found`);
    }

    // Validate quantity
    if (selectedPart.qtyLeft < quantityUsed) {
      throw new Error(`Insufficient quantity available. Requested: ${quantityUsed}, Available: ${selectedPart.qtyLeft}`);
    }

    // Create new deployment
    const newDeployment = new Deployment({
      seq,
      date,
      clientName,
      vehicleModel,
      arrivalDate,
      part: selectedPart._id,
      quantityUsed: parseInt(quantityUsed),
      deploymentStatus: deploymentStatus || false,
      deploymentDate,
      releaseStatus: releaseStatus || false,
      releaseDate,
      creator: user._id,
    });

    // Save deployment
    await newDeployment.save({ session });

    // Update part quantity
    selectedPart.qtyLeft -= parseInt(quantityUsed);
    if (selectedPart.deployments) {
      selectedPart.deployments.push(newDeployment._id);
    }
    await selectedPart.save({ session });

    // Link deployment to user's deployments
    if (user.allDeployments) {
      user.allDeployments.push(newDeployment._id);
      await user.save({ session });
    }

    await session.commitTransaction();
    
    const populatedDeployment = await Deployment.findById(newDeployment._id)
      .populate('part')
      .populate('creator');
    
    res.status(201).json({ 
      message: 'Deployment created successfully', 
      deployment: populatedDeployment 
    });
  } catch (error) {
    await session.abortTransaction();
    console.log('Error creating deployment:', error); // Add this for debugging
    res.status(500).json({ message: 'Failed to create deployment', error: error.message });
  } finally {
    session.endSession();
  }
};

const updateDeployment = async (req, res) => {
  const { id } = req.params;
  const {
    deploymentStatus,
    deploymentDate,
    releaseStatus,
    releaseDate,
    seq,
    date,
    clientName,
    vehicleModel,
    arrivalDate,
    part,
    quantityUsed
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find the existing deployment
    const deployment = await Deployment.findById(id).populate('part').session(session);
    if (!deployment) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    // Check if only deployment and release statuses and dates are being updated
    const isStatusUpdateOnly = !(
      seq || date || clientName || vehicleModel || arrivalDate || part || quantityUsed
    );

    if (isStatusUpdateOnly) {
      // Update deployment status and date if provided
      if (deploymentStatus !== undefined) {
        deployment.deploymentStatus = deploymentStatus;
        deployment.deploymentDate = deploymentDate;

        // If deployment status is set to false, also set release status to false
        if (deployment.deploymentStatus === false) {
          deployment.releaseStatus = false;
          deployment.releaseDate = null; // Optionally clear the release date
        }
      }

      // Allow release status and date update only if deployment status is `true`
      if (deployment.deploymentStatus === true && releaseStatus !== undefined) {
        deployment.releaseStatus = releaseStatus;
        deployment.releaseDate = releaseDate;
      } else if (releaseStatus !== undefined) {
        return res.status(404).json({ message: 'Release status cannot be updated until deployment is complete.' });
      }

      await deployment.save({ session });
      await session.commitTransaction();

      res.status(200).json({
        message: 'Deployment status and dates updated successfully',
        deployment
      });
      return;
    }

    // Proceed with full validation and updates if additional fields are present
    const [partName, brandName] = part.split('|');
    if (!partName || !brandName) {
      return res.status(404).json({ message: 'Invalid part format. Expected "partName|brandName"' });
    }

    const newPart = await Part.findOne({
      partName: partName,
      brandName: brandName
    }).session(session);

    if (!newPart) {
      return res.status(404).json({ message: `Part with name "${partName}" and brand "${brandName}" not found` });
    }

    const oldPart = deployment.part;
    const oldQuantityUsed = deployment.quantityUsed;
    const newQuantityUsed = parseInt(quantityUsed);

    if (oldPart._id.toString() === newPart._id.toString()) {
      const quantityDifference = newQuantityUsed - oldQuantityUsed;

      if (newPart.qtyLeft < quantityDifference) {
        return res.status(404).json({ message: `Insufficient quantity available. Need ${quantityDifference} more, but only ${newPart.qtyLeft} available` });
      }

      newPart.qtyLeft -= quantityDifference;
      await newPart.save({ session });
    } else {
      oldPart.qtyLeft += oldQuantityUsed;
      await oldPart.save({ session });

      if (newPart.qtyLeft < newQuantityUsed) {
        return res.status(404).json({ message: `Insufficient quantity available. Requested: ${newQuantityUsed}, Available: ${newPart.qtyLeft}` });
      }

      newPart.qtyLeft -= newQuantityUsed;
      await newPart.save({ session });

      if (oldPart.deployments) {
        oldPart.deployments.pull(deployment._id);
        await oldPart.save({ session });
      }

      if (newPart.deployments) {
        newPart.deployments.push(deployment._id);
        await newPart.save({ session });
      }
    }

    deployment.seq = seq;
    deployment.date = date;
    deployment.clientName = clientName;
    deployment.vehicleModel = vehicleModel;
    deployment.arrivalDate = arrivalDate;
    deployment.part = newPart._id;
    deployment.quantityUsed = newQuantityUsed;

    if (deploymentStatus !== undefined) {
      deployment.deploymentStatus = deploymentStatus;
      deployment.deploymentDate = deploymentDate;

      // If deployment status is set to false, also set release status to false
      if (deployment.deploymentStatus === false) {
        deployment.releaseStatus = false;
        deployment.releaseDate = null;
      }
    }

    if (deployment.deploymentStatus === true && releaseStatus !== undefined) {
      deployment.releaseStatus = releaseStatus;
      deployment.releaseDate = releaseDate;
    }

    await deployment.save({ session });
    await session.commitTransaction();

    const populatedDeployment = await Deployment.findById(deployment._id)
      .populate('part')
      .populate('creator');

    res.status(200).json({
      message: 'Deployment updated successfully',
      deployment: populatedDeployment
    });

  } catch (error) {
    await session.abortTransaction();
    console.log('Error updating deployment:', error);
    res.status(500).json({ message: 'Failed to update deployment', error: error.message });
  } finally {
    session.endSession();
  }
};

const deleteDeployment = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deployment = await Deployment.findById(id)
      .populate('creator')
      .populate('part')
      .session(session);

    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    // Restore part quantity
    const part = deployment.part;
    if (part) {
      part.qtyLeft += deployment.quantityUsed;
      if (part.deployments) {
        part.deployments.pull(deployment._id);
      }
      await part.save({ session });
    }

    // Remove deployment from user's deployments if needed
    if (deployment.creator && deployment.creator.allDeployments) {
      deployment.creator.allDeployments.pull(deployment._id);
      await deployment.creator.save({ session });
    }

    // Delete the deployment
    await Deployment.findByIdAndDelete(id).session(session);
    await session.commitTransaction();

    res.status(200).json({ message: 'Deployment deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to delete deployment', error: error.message });
  } finally {
    session.endSession();
  }
};

export {
  getAllDeployments,
  getDeploymentDetail,
  createDeployment,
  updateDeployment,
  deleteDeployment,
};