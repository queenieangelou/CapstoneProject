//server\controller\procurement.controller.js
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Procurement from '../mongodb/models/procurement.js';
import Deployment from '../mongodb/models/deployment.js';
import User from '../mongodb/models/user.js';
import Part from '../mongodb/models/part.js';

dotenv.config();

const getAllProcurements = async (req, res) => {
  const {
    _end, _order, _start, _sort, supplierName_like = '',
  } = req.query;

  const query = { deleted: false };

  if (supplierName_like) {
    query.supplierName = { $regex: supplierName_like, $options: 'i' };
  }

  try {
    const count = await Procurement.countDocuments(query);

    const procurements = await Procurement
      .find(query)
      .limit(parseInt(_end) - parseInt(_start))
      .skip(parseInt(_start))
      .sort({ [_sort]: _order })
      .populate('part', 'partName brandName');

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');
    res.status(200).json(procurements);
  } catch (err) {
    console.error('Error fetching procurements:', err.message);
    res.status(500).json({ message: 'Fetching procurements failed, please try again later.' });
  }
};

const getProcurementDetail = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format.' });
    }

    const procurement = await Procurement.findById(id)
      .populate('creator')
      .populate('part')
      .session(session);

    if (!procurement) {
      return res.status(404).json({ message: 'Procurement not found.' });
    }

    const response = {
      ...procurement.toObject(),
      partName: procurement.part ? procurement.part.partName : null,
      brandName: procurement.part ? procurement.part.brandName : null,
    };
    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching procurement detail:', err);
    res.status(500).json({ message: 'Failed to get the procurement details. Please try again later.' });
  } finally {
    session.endSession();
  }
};

const createProcurement = async (req, res) => {
  const {
    email, seq, date, supplierName, reference, tin, address, partName, brandName, description,
    quantityBought, amount, netOfVAT, inputVAT, isNonVat, noValidReceipt
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) throw new Error('User not found.');

    let part = await Part.findOne({ partName, brandName }).session(session);

    if (!part) {
      part = new Part({
        partName,
        brandName,
        qtyLeft: parseInt(quantityBought),
        procurements: []
      });
    } else {
      part.qtyLeft += parseInt(quantityBought);
    }
    await part.save({ session });

    let calculatedNetOfVAT, calculatedInputVAT, finalIsNonVat = isNonVat;
    if (noValidReceipt) {
      calculatedNetOfVAT = 0;
      calculatedInputVAT = 0;
      finalIsNonVat = true;
    } else if (isNonVat) {
      calculatedNetOfVAT = amount;
      calculatedInputVAT = 0;
    } else {
      calculatedNetOfVAT = netOfVAT;
      calculatedInputVAT = inputVAT;
    }

    const newProcurement = new Procurement({
      seq,
      date,
      supplierName: noValidReceipt ? "N/A" : supplierName,
      reference: noValidReceipt ? "N/A" : reference,
      tin: noValidReceipt ? "N/A" : tin,
      address: noValidReceipt ? "N/A" : address,
      part: part._id,
      description,
      quantityBought: parseInt(quantityBought),
      amount,
      netOfVAT: calculatedNetOfVAT,
      inputVAT: calculatedInputVAT,
      isNonVat: finalIsNonVat,
      noValidReceipt,
      creator: user._id,
    });

    await newProcurement.save({ session });
    part.procurements.push(newProcurement._id);
    await part.save({ session });
    user.allProcurements.push(newProcurement._id);
    await user.save({ session });

    await session.commitTransaction();
    res.status(201).json({ message: 'Procurement created successfully', procurement: newProcurement });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error creating procurement:', error);
    res.status(500).json({ message: 'Failed to create procurement.', error: error.message });
  } finally {
    session.endSession();
  }
};

const updateProcurement = async (req, res) => {
  const { id } = req.params;
  const {
    seq, date, supplierName, reference, tin, address, description, partName, brandName,
    quantityBought, amount, netOfVAT, inputVAT, isNonVat, noValidReceipt
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const procurement = await Procurement.findById(id).populate('part').session(session);
    if (!procurement) return res.status(404).json({ message: 'Procurement not found.' });

    const oldPart = procurement.part;
    oldPart.qtyLeft -= procurement.quantityBought;
    await oldPart.save({ session });

    let newPart = await Part.findOne({ partName, brandName }).session(session);
    if (!newPart) {
      newPart = new Part({
        partName,
        brandName,
        qtyLeft: parseInt(quantityBought),
        procurements: []
      });
    } else {
      newPart.qtyLeft += parseInt(quantityBought);
    }
    await newPart.save({ session });

    let calculatedNetOfVAT, calculatedInputVAT, finalIsNonVat = isNonVat;
    if (noValidReceipt) {
      calculatedNetOfVAT = 0;
      calculatedInputVAT = 0;
      finalIsNonVat = true;
    } else if (isNonVat) {
      calculatedNetOfVAT = amount;
      calculatedInputVAT = 0;
    } else {
      calculatedNetOfVAT = netOfVAT;
      calculatedInputVAT = inputVAT;
    }

    procurement.set({
      seq, date, description, amount, isNonVat: finalIsNonVat, noValidReceipt,
      netOfVAT: calculatedNetOfVAT, inputVAT: calculatedInputVAT,
      supplierName: noValidReceipt ? "N/A" : supplierName,
      reference: noValidReceipt ? "N/A" : reference,
      tin: noValidReceipt ? "N/A" : tin,
      address: noValidReceipt ? "N/A" : address,
      part: newPart._id,
      quantityBought: parseInt(quantityBought)
    });

    await procurement.save({ session });
    oldPart.procurements.pull(procurement._id);
    await oldPart.save({ session });
    newPart.procurements.push(procurement._id);
    await newPart.save({ session });

    await session.commitTransaction();
    res.status(200).json({ message: 'Procurement updated successfully', procurement });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error updating procurement:', error);
    res.status(500).json({ message: 'Failed to update procurement.', error: error.message });
  } finally {
    session.endSession();
  }
};

const deleteProcurement = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Handle multiple IDs
    const ids = id.split(',');

    // Validate all IDs first
    const validIds = ids.every(id => mongoose.Types.ObjectId.isValid(id));
    if (!validIds) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }

    // Fetch all procurements to be deleted
    const procurements = await Procurement.find({ _id: { $in: ids } }).populate('part').session(session);
    if (procurements.length === 0) {
      return res.status(404).json({ message: 'No procurements found to delete' });
    }

    // Check if any part associated with the procurements is used in a deployment
    for (const procurement of procurements) {
      const part = procurement.part;
      if (part) {
        const deploymentsUsingPart = await Deployment.find({
          'parts.part': part._id,
          deleted: false, // Ignore deleted deployments
        }).session(session);

        if (deploymentsUsingPart.length > 0) {
          return res.status(400).json({
            message: `Cannot delete procurement. Part "${part.partName}" is already used in deployment(s).`,
          });
        }
      }
    }

    // Perform soft delete for all selected procurements
    const updateResult = await Procurement.updateMany(
      { 
        _id: { $in: ids },
        deleted: false // Only update non-deleted procurements
      },
      {
        $set: {
          deleted: true,
          deletedAt: new Date()
        }
      },
      { session }
    );

    // If no procurements were modified, return a 404 error
    if (updateResult.modifiedCount === 0) {
      return res.status(404).json({ message: 'No procurements found to delete' });
    }

    // Update associated parts and creator records
    for (const procurement of procurements) {
      const part = procurement.part;
      if (part) {
        // Check if this is a newly added part through this procurement
        const isNewlyAddedPart = part.procurements.length === 1 &&
          part.procurements[0].toString() === procurement._id.toString();
        if (isNewlyAddedPart) {
          // Soft delete the part if it was newly added through this procurement
          part.deleted = true;
          part.deletedAt = new Date();
        }
        // Update part quantities and references regardless
        part.qtyLeft -= procurement.quantityBought;
        part.procurements.pull(procurement._id);
        await part.save({ session });
      }

      // Remove procurement from creator's allProcurements array
      const creator = procurement.creator;
      if (creator && creator.allProcurements) {
        creator.allProcurements.pull(procurement._id);
        await creator.save({ session });
      }
    }

    await session.commitTransaction();
    res.status(200).json({ 
      message: `Successfully deleted ${updateResult.modifiedCount} procurement(s)`,
      deletedCount: updateResult.modifiedCount
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deleting procurement:', error);
    res.status(500).json({ message: 'Failed to delete procurements', error: error.message });
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
