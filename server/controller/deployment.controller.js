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
  const { seq, date, clientName, vehicleModel, part, quantityUsed } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const newDeployment = await Deployment.create({
      seq,
      date,
      clientName,
      vehicleModel,
      part,
      quantityUsed,
    });

    // Update the part's quantity
    const updatedPart = await Part.findByIdAndUpdate(
      part,
      { $inc: { qtyLeft: -quantityUsed } },
      { new: true, session }
    );

    if (updatedPart.qtyLeft < 0) {
      throw new Error('Insufficient quantity');
    }

    await session.commitTransaction();
    res.status(201).json(newDeployment);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
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