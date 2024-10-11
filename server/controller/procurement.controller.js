/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Procurement from '../mongodb/models/procurement.js';
import User from '../mongodb/models/user.js';
import Part from '../mongodb/models/part.js';

dotenv.config();

const getAllProcurements = async (req, res) => {
  const {
    _end, _order, _start, _sort, supplierName_like = '',
  } = req.query;

  const query = {};

  if (supplierName_like) {
    query.supplierName = { $regex: supplierName_like, $options: 'i' };
  }

  try {
    const count = await Procurement.countDocuments(query);

    const procurements = await Procurement
      .find(query)
      .limit(parseInt(_end) - parseInt(_start)) // Make sure to adjust pagination limits
      .skip(parseInt(_start))
      .sort({ [_sort]: _order })
      .populate('part', 'partName brandName'); // This populates part with only partName and brandName

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');

    res.status(200).json(procurements);
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: 'Fetching procurements failed, please try again later' });
  }
};

const getProcurementDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    const procurementExists = await Procurement.findOne({ _id: id }).populate('creator').populate('part').session(session);

    if (procurementExists) {
      res.status(200).json(procurementExists);
    } else {
      res.status(404).json({ message: 'Procurement does not exist' });
    }
  } catch (err) {
    console.error('Error fetching procurement detail:', err);
    res.status(500).json({ message: 'Failed to get the procurement details, please try again later' });
  } finally {
    session.endSession();
  }
};

const createProcurement = async (req, res) => {
  const {
    email,
    seq,
    date,
    supplierName,
    reference,
    tin,
    address,
    partName,
    brandName,
    description,
    quantityBought,
    amount,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if the part already exists
    let part = await Part.findOne({ partName: partName, brandName: brandName }).session(session);

    if (!part) {
      // Create new part if it doesn't exist
      part = new Part({
        partName: partName,
        brandName: brandName,
        quantity: quantityBought,
        procurements: []  // Initialize procurements list
      });
      await part.save({ session });
    } else {
      // Update part quantity
      part.quantity += quantityBought;
      await part.save({ session });
    }

    // Create the procurement
    const newProcurement = new Procurement({
      seq,
      date,
      supplierName,
      reference,
      tin,
      address,
      description,
      part: part._id,  // Linking the part by its ID
      quantityBought,
      amount,
      creator: user._id,  // Linking the user
    });

    // Save procurement
    await newProcurement.save({ session });

    // Link procurement to part's procurements
    part.procurements.push(newProcurement._id);
    await part.save({ session });

    // Link procurement to user's procurements
    user.allProcurements.push(newProcurement._id);
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Procurement created successfully', procurement: newProcurement });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to create procurement', error: error.message });
  } finally {
    session.endSession();
  }
};

const updateProcurement = async (req, res) => {
  const { id } = req.params;
  const { seq, date, supplierName, reference, tin, address, description, partName, brandName, quantityBought, amount } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const procurement = await Procurement.findById(id).session(session);
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    let part = await Part.findOne({ partName: partName, brandName: brandName }).session(session);

    if (!part) {
      // Create new part if it doesn't exist
      part = new Part({
        partName: partName,
        brandName: brandName,
        qtyLeft: quantityBought,
        procurements: []
      });
      await part.save({ session });
    } else {
      // Update part quantity based on the difference in quantities
      const previousQuantity = procurement.quantityBought;
      part.quantity += (quantityBought - previousQuantity);  // Adjust for the difference
      await part.save({ session });
    }

    // Update procurement details
    procurement.seq = seq;
    procurement.date = date;
    procurement.supplierName = supplierName;
    procurement.reference = reference;
    procurement.tin = tin;
    procurement.address = address;
    procurement.description = description;
    procurement.part = part._id;
    procurement.quantityBought = quantityBought;
    procurement.amount = amount;

    await procurement.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: 'Procurement updated successfully', procurement });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to update procurement', error: error.message });
  } finally {
    session.endSession();
  }
};


const deleteProcurement = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const procurement = await Procurement.findById(id).populate('creator').populate('part').session(session);
    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found' });
    }

    // Adjust part quantity
    const part = procurement.part;
    if (part) {
      part.quantity -= procurement.quantityBought;
      part.procurements.pull(procurement._id);  // Remove procurement from part's procurements
      await part.save({ session });
    }

    // Remove procurement from user's procurements
    procurement.creator.allProcurements.pull(procurement._id);
    await procurement.creator.save({ session });

    // Delete the procurement
    await procurement.remove({ session });
    await session.commitTransaction();

    res.status(200).json({ message: 'Procurement deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to delete procurement', error: error.message });
  } finally {
    session.endSession();
  }
};

export {
  getAllProcurements,
  getProcurementDetail,
  createProcurement,
  updateProcurement,
  deleteProcurement,
};
