/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
import * as dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

import mongoose from 'mongoose';
import Procurement from '../mongodb/models/procurement.js';
import User from '../mongodb/models/user.js';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const getAllProcurements = async (req, res) => {
  const {
    _end, _order, _start, _sort, title_like = '', procurementType = '',
  } = req.query;

  const query = {};

  if (procurementType !== '') {
    query.procurementType = procurementType;
  }

  if (title_like) {
    query.title = { $regex: title_like, $options: 'i' };
  }

  try {
    const count = await Procurement.countDocuments({ query });

    const procurements = await Procurement
      .find(query)
      .limit(_end)
      .skip(_start)
      .sort({ [_sort]: _order });

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');

    res.status(200).json(procurements);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Fetching procurements failed, please try again later' });
  }
};

const getProcurementDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const procurementExists = await Procurement.findOne({ _id: id }).populate('creator');

    if (procurementExists) res.status(200).json(procurementExists);
    else res.status(404).json({ message: 'Procurement does not exist' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to get the procurement details, please try again later' });
  }
};

const createProcurement = async (req, res) => {
  try {
    const {
      title, description, procurementType, location, price, photo, email,
    } = req.body;

    // Start a new session
    const session = await mongoose.startSession();
    session.startTransaction();

    // Retrieve user by email
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const photoUrl = await cloudinary.uploader.upload(photo);

    // Create a new procurement
    const newProcurement = await Procurement.create(
      {
        title,
        description,
        procurementType,
        location,
        price,
        photo: photoUrl.url,
        creator: user._id,
      },
    );

    // Update the user's allProcurements field with the new procurement
    user.allProcurements.push(newProcurement._id);
    await user.save({ session });

    // Commit the transaction
    await session.commitTransaction();
    session.endSession(); // End the session

    // Send response
    res.status(200).json({ message: 'Procurement created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create procurement, please try again later' });
  }
};

const updateProcurement = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, description, procurementType, location, price, photo,
    } = req.body;

    let photoUrl = '';
    if (photo) {
      photoUrl = await cloudinary.uploader.upload(photo);
    }

    // Update a new procurement
    await Procurement.findByIdAndUpdate({ _id: id }, {
      title,
      description,
      procurementType,
      location,
      price,
      photo: photoUrl?.url || photo,
    });

    // Send response
    res.status(200).json({ message: 'Procurement created successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to create procurement, please try again later' });
  }
};

const deleteProcurement = async (req, res) => {
  let toDeleteProcurement;

  try {
    const { id } = req.params;

    // Fetch the procurement to be deleted
    toDeleteProcurement = await Procurement.findById(id).populate('creator');
    if (!toDeleteProcurement) {
      return res.status(404).json({ message: 'Procurement not found' }); // Return 404 for not found
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    // Remove the procurement and update the creator
    await toDeleteProcurement.remove({ session });
    toDeleteProcurement.creator.allProperties.pull(toDeleteProcurement._id); // Ensure you use _id here

    await toDeleteProcurement.creator.save({ session });
    await session.commitTransaction();
    session.endSession(); // End the session

    res.status(200).json({ message: 'Procurement deleted successfully' });
  } catch (err) {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: 'Failed to delete procurement, please try again later' });
  }
};

export {
  getAllProcurements,
  getProcurementDetail,
  createProcurement,
  updateProcurement,
  deleteProcurement,
};
