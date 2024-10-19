// server\controller\sale.controller.js
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Sale from '../mongodb/models/sale.js';
import User from '../mongodb/models/user.js';

dotenv.config();

const getAllSales = async (req, res) => {
  const {
    _end, _order, _start, _sort, clientName_like = '',
  } = req.query;

  const query = {};

  if (clientName_like) {
    query.clientName = { $regex: clientName_like, $options: 'i' };
  }

  try {
    const count = await Sale.countDocuments(query);

    const sales = await Sale
      .find(query)
      .limit(parseInt(_end) - parseInt(_start))
      .skip(parseInt(_start))
      .sort({ [_sort]: _order });

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');

    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ message: 'Fetching sales failed, please try again later' });
  }
};

const getSaleDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const saleExists = await Sale.findOne({ _id: id }).populate('creator');

    if (saleExists) {
      res.status(200).json(saleExists);
    } else {
      res.status(404).json({ message: 'Sale does not exist' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get the sale details, please try again later' });
  }
};

const createSale = async (req, res) => {
  console.log('Received sale creation request with body:', req.body);
  try {
    const {
      seq, date, clientName, tin, amount, netOfVAT, outputVAT, email,
    } = req.body;

    console.log('Parsed sale data:', { seq, date, clientName, tin, amount, netOfVAT, outputVAT, email });

    // Validate required fields
    if (!seq || !date || !clientName || !tin || !amount) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findOne({ email }).session(session);

      if (!user) {
        console.log('User not found for email:', email);
        throw new Error('User not found');
      }

      const newSale = await Sale.create({
        seq,
        date,
        clientName,
        tin,
        amount,
        netOfVAT,
        outputVAT,
        creator: user._id,
      });

      user.allSales.push(newSale._id);
      await user.save({ session });

      await session.commitTransaction();


      res.status(200).json({ message: 'Sale created successfully', sale: newSale });
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {

    res.status(500).json({ message: 'Failed to create sale', error: error.message });
  }
};

const updateSale = async (req, res) => {
  try {
    const { id } = req.params;
    const { seq, date, clientName, tin, amount, netOfVAT, outputVAT } = req.body;

    // Input validation
    if (typeof amount !== 'number' || isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const updatedSale = await Sale.findByIdAndUpdate(
      { _id: id },
      {
        seq,
        date,
        clientName,
        tin,
        amount,
        netOfVAT,
        outputVAT,
      },
      { new: true, runValidators: true }
    );

    if (!updatedSale) {
      return res.status(404).json({ message: 'Sale not found' });
    }

    res.status(200).json(updatedSale);
  } catch (error) {

    res.status(500).json({ message: 'Failed to update sale', error: error.message });
  }
};

const deleteSale = async (req, res) => {
  try {
    const { id } = req.params;

    const saleToDelete = await Sale.findById({ _id: id }).populate('creator');

    if (!saleToDelete) throw new Error('Sale not found');

    const session = await mongoose.startSession();
    session.startTransaction();

    saleToDelete.remove({ session });
    saleToDelete.creator.allSales.pull(saleToDelete);

    await saleToDelete.creator.save({ session });
    await session.commitTransaction();

    res.status(200).json({ message: 'Sale deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete sale, please try again later' });
  }
};

export {
  getAllSales,
  getSaleDetail,
  createSale,
  updateSale,
  deleteSale,
};