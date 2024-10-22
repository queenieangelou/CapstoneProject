// server/controller/deployment.controller.js

import Deployment from '../mongodb/models/deployment.js';
import Part from '../mongodb/models/part.js';
import mongoose from 'mongoose';

const getAllDeployments = async (req, res) => {
  try {
    const deployments = await Deployment.find({}).populate('part');
    res.status(200).json(deployments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeploymentDetail = async (req, res) => {
  const { id } = req.params;
  
  try {
    const deployment = await Deployment.findById(id).populate('part');
    if (!deployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }
    res.status(200).json(deployment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createDeployment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    console.log('Received request body:', req.body);

    const { 
      seq, 
      date, 
      clientName, 
      vehicleModel, 
      part, 
      quantityUsed,
      deploymentStatus,
      deploymentDate,
      releaseStatus,
      releaseDate,
      creator 
    } = req.body;

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!seq) missingFields.push('seq');
    if (!date) missingFields.push('date');
    if (!clientName) missingFields.push('clientName');
    if (!vehicleModel) missingFields.push('vehicleModel');
    if (!part) missingFields.push('part');
    if (!quantityUsed) missingFields.push('quantityUsed');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate data types
    if (typeof seq !== 'number') throw new Error('seq must be a number');
    if (typeof quantityUsed !== 'number') throw new Error('quantityUsed must be a number');
    if (!mongoose.Types.ObjectId.isValid(part)) throw new Error('Invalid part ID');

    // Check if part exists and has enough quantity
    const selectedPart = await Part.findById(part);
    if (!selectedPart) {
      throw new Error(`Part with ID ${part} not found`);
    }
    
    console.log('Found part:', selectedPart);
    console.log('Requested quantity:', quantityUsed);
    console.log('Available quantity:', selectedPart.qtyLeft);

    if (selectedPart.qtyLeft < quantityUsed) {
      throw new Error(`Insufficient quantity available. Requested: ${quantityUsed}, Available: ${selectedPart.qtyLeft}`);
    }

    // Create new deployment
    const newDeployment = await Deployment.create([{
      seq,
      date,
      clientName,
      vehicleModel,
      part,
      quantityUsed,
      deploymentStatus: deploymentStatus || false,
      deploymentDate,
      releaseStatus: releaseStatus || false,
      releaseDate,
      creator
    }], { session });

    console.log('Created deployment:', newDeployment);

    // Update part quantity
    const updatedPart = await Part.findByIdAndUpdate(
      part,
      { $inc: { qtyLeft: -quantityUsed } },
      { new: true, session }
    );

    console.log('Updated part:', updatedPart);

    await session.commitTransaction();
    
    // Populate part details before sending response
    const populatedDeployment = await Deployment.findById(newDeployment[0]._id).populate('part');
    
    res.status(201).json(populatedDeployment);
  } catch (error) {
    console.error('Error in createDeployment:', error);
    await session.abortTransaction();
    res.status(400).json({ 
      message: error.message,
      success: false,
      details: {
        error: error.toString(),
        requestBody: req.body
      }
    });
  } finally {
    session.endSession();
  }
};


const updateDeployment = async (req, res) => {
  const { id } = req.params;
  const { deploymentStatus, deploymentDate, releaseStatus, releaseDate } = req.body;

  try {
    const updatedDeployment = await Deployment.findByIdAndUpdate(
      id,
      { 
        deploymentStatus, 
        deploymentDate, 
        releaseStatus, 
        releaseDate 
      },
      { new: true }
    );

    if (!updatedDeployment) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    res.status(200).json(updatedDeployment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDeployment = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const deploymentToDelete = await Deployment.findById(id);
    if (!deploymentToDelete) {
      return res.status(404).json({ message: 'Deployment not found' });
    }

    // Restore the part's quantity
    await Part.findByIdAndUpdate(
      deploymentToDelete.part,
      { $inc: { qtyLeft: deploymentToDelete.quantityUsed } },
      { session }
    );

    await Deployment.findByIdAndDelete(id);

    await session.commitTransaction();
    res.status(200).json({ message: 'Deployment deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
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