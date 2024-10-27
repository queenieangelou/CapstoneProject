// server\controller\expense.controller.js
import * as dotenv from 'dotenv';
import mongoose from 'mongoose';
import Expense from '../mongodb/models/expense.js';
import User from '../mongodb/models/user.js';

dotenv.config();

const getAllExpenses = async (req, res) => {
  const {
    _end, _order, _start, _sort, clientName_like = '',
  } = req.query;

  const query = {};

  if (clientName_like) {
    query.clientName = { $regex: clientName_like, $options: 'i' };
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
  console.log('Received expense creation request with body:', req.body);
  try {
    const {
      seq, date, clientName, tin, amount, netOfVAT, outputVAT, email,
    } = req.body;

    console.log('Parsed expense data:', { seq, date, clientName, tin, amount, netOfVAT, outputVAT, email });

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

      const newExpense = await Expense.create({
        seq,
        date,
        clientName,
        tin,
        amount,
        netOfVAT,
        outputVAT,
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
    const { seq, date, clientName, tin, amount, netOfVAT, outputVAT } = req.body;

    // Input validation
    if (typeof amount !== 'number' || isNaN(amount)) {
      return res.status(400).json({ message: 'Invalid amount' });
    }

    const updatedExpense = await Expense.findByIdAndUpdate(
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