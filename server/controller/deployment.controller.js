import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Deployment from '../mongodb/models/deployment.js';
import User from '../mongodb/models/user.js';
import Part from '../mongodb/models/part.js';

dotenv.config();

const getAllDeployments = async (req, res) => {
  const {
    _end,
    _order,
    _start,
    _sort,
    clientName_like = '',
  } = req.query;

  const query = {};

  if (clientName_like) {
    query.clientName = { $regex: clientName_like, $options: 'i' };
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

    const deploymentExists = await Deployment.findOne({ _id: id }).populate('creator').populate('part').session(session);

    if (deploymentExists) {
      res.status(200).json(deploymentExists);
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
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      email,
      seq,
      date,
      clientName,
      tin,
      vehicleModel,
      partId,
      quantityUsed,
      amount,
      netOfVAT,
      outputVAT,
    } = req.body;

    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error('User not found');

    const part = await Part.findById(partId).session(session);
    if (!part) throw new Error('Part not found');

    if (part.qtyLeft < quantityUsed) throw new Error('Insufficient quantity');

    part.qtyLeft -= quantityUsed;
    await part.save({ session });

    const newDeployment = new Deployment({
      seq,
      date,
      clientName,
      tin,
      vehicleModel,
      part: part._id,
      quantityUsed,
      amount,
      netOfVAT,
      outputVAT,
      creator: user._id,
    });

    await newDeployment.save({ session });

    user.allDeployments = user.allDeployments || [];
    user.allDeployments.push(newDeployment._id);
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Deployment created successfully', deployment: newDeployment });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to create deployment', error: error.message });
  } finally {
    session.endSession();
  }
};

const updateDeployment = async (req, res) => {
  const { id } = req.params;
  const {
    seq,
    date,
    clientName,
    tin,
    vehicleModel,
    partId,
    quantityUsed,
    deploymentStatus,
    deploymentDate,
    releaseStatus,
    releaseDate,
    amount,
    netOfVAT,
    outputVAT,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deployment = await Deployment.findById(id).populate('part').session(session);
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    // Adjust the old part's quantity
    const oldPart = deployment.part;
    oldPart.qtyLeft += deployment.quantityUsed;
    await oldPart.save({ session });

    // Find the new part
    const newPart = await Part.findById(partId).session(session);
    if (!newPart) {
      return res.status(404).json({ message: 'New part not found' });
    }

    if (newPart.qtyLeft < quantityUsed) {
      return res.status(400).json({ message: 'Insufficient quantity for the new part' });
    }

    newPart.qtyLeft -= quantityUsed;
    await newPart.save({ session });

    // Update deployment details
    deployment.seq = seq;
    deployment.date = date;
    deployment.clientName = clientName;
    deployment.tin = tin;
    deployment.vehicleModel = vehicleModel;
    deployment.part = newPart._id;
    deployment.quantityUsed = quantityUsed;
    deployment.deploymentStatus = deploymentStatus;
    deployment.deploymentDate = deploymentDate;
    deployment.releaseStatus = releaseStatus;
    deployment.releaseDate = releaseDate;
    deployment.amount = amount;
    deployment.netOfVAT = netOfVAT;
    deployment.outputVAT = outputVAT;

    await deployment.save({ session });

    await session.commitTransaction();

    res.status(200).json({ message: 'Deployment updated successfully', deployment });
  } catch (error) {
    await session.abortTransaction();
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
    const deployment = await Deployment.findById(id).populate('creator').populate('part').session(session);
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    // Adjust part quantity
    const part = deployment.part;
    if (part) {
      part.qtyLeft += deployment.quantityUsed;
      await part.save({ session });
    }

    // Remove deployment from user's deployments
    if (deployment.creator) {
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