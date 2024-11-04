// server\controller\expense.controller.js
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Expense from '../mongodb/models/expense.js';
import User from '../mongodb/models/user.js';

dotenv.config();

const getAllExpenses = async (req, res) => {
  const {
    _end, _order, _start, _sort, supplierName_like = '',
  } = req.query;

  const query = {};

  if (supplierName_like) {
    query.supplierName = { $regex: supplierName_like, $options: 'i' };
  }

  try {
    const count = await Expense.countDocuments(query);

    const expenses = await Expense
      .find(query)
      .limit(parseInt(_end) - parseInt(_start))
      .skip(parseInt(_start))
      .sort({ [_sort]: _order });

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Fetching expenses failed, please try again later' });
  }
};

const getExpenseDetail = async (req, res) => {
  const { id } = req.params;

  try {
    const expenseExists = await Expense.findOne({ _id: id }).populate('creator');

    if (expenseExists) {
      res.status(200).json(expenseExists);
    } else {
      res.status(404).json({ message: 'Expense does not exist' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get the expense details, please try again later' });
  }
};

const createExpense = async (req, res) => {
  try {
    const {
      seq,
      date,
      supplierName,
      ref,
      tin,
      address,
      description,
      amount,
      netOfVAT,
      inputVAT,
      total,
      net,
      isNonVat,
      noValidReceipt,
      email,
    } = req.body;

    // Start a session for transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const user = await User.findOne({ email }).session(session);

      if (!user) {
        throw new Error('User not found');
      }

      const newExpense = await Expense.create({
        seq,
        date,
        supplierName,
        ref,
        tin,
        address,
        description,
        amount,
        netOfVAT,
        inputVAT,
        total,
        net,
        isNonVat,
        noValidReceipt,
        creator: user._id,
      });

      user.allExpenses.push(newExpense._id);
      await user.save({ session });

      await session.commitTransaction();


      res.status(200).json({ message: 'Expense created successfully', expense: newExpense });
    } catch (error) {
      await session.abortTransaction();

      throw error;
    } finally {
      session.endSession();
    }
  } catch (error) {

    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      seq,
      date,
      supplierName,
      ref,
      tin,
      address,
      description,
      amount,
      netOfVAT,
      inputVAT,
      total,
      net,
      isNonVat,
      noValidReceipt,
    } = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      { _id: id },
      {
        seq,
        date,
        supplierName,
        ref,
        tin,
        address,
        description,
        amount,
        netOfVAT,
        inputVAT,
        total,
        net,
        isNonVat,
        noValidReceipt,
      },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(200).json(updatedExpense);
  } catch (error) {

    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;

    const expenseToDelete = await Expense.findById({ _id: id }).populate('creator');
    
    if (!expenseToDelete) throw new Error('Expense not found');

    const session = await mongoose.startSession();
    session.startTransaction();

    expenseToDelete.remove({ session });
    expenseToDelete.creator.allExpenses.pull(expenseToDelete);

    await expenseToDelete.creator.save({ session });
    await session.commitTransaction();
    
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete expense, please try again later' });
  }
};

export {
  getAllExpenses,
  getExpenseDetail,
  createExpense,
  updateExpense,
  deleteExpense,
};