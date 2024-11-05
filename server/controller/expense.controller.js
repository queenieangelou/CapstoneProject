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
      .sort({ [_sort]: _order })
      .populate('creator', 'name email');

    res.header('x-total-count', count);
    res.header('Access-Control-Expose-Headers', 'x-total-count');

    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Fetching expenses failed, please try again later' });
  }
};

const getExpenseDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid ID format' });
    }
    const expense = await Expense.findById(id).populate('creator', 'name email');

    if (!expense) {
      return res.status(404).json({ message: 'Expense does not exist' });
    }
    res.status(200).json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get the expense details, please try again later' });
  }
};

const createExpense = async (req, res) => {
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
    isNonVat,
    noValidReceipt,
    email,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findOne({ email }).session(session);
    if (!user) {
      throw new Error('User not found');
    }

    const newExpense = new Expense({
      seq,
      date,
      supplierName: noValidReceipt ? "N/A" : supplierName,
      ref: noValidReceipt ? "N/A" : ref,
      tin: noValidReceipt ? "N/A" : tin,
      address: noValidReceipt ? "N/A" : address,
      description,
      amount,
      netOfVAT: isNonVat ? amount : netOfVAT,
      inputVAT: isNonVat || noValidReceipt ? 0 : inputVAT,
      isNonVat,
      noValidReceipt,
      creator: user._id,
    });

    await newExpense.save({ session });

    if (user.allExpenses) {
      user.allExpenses.push(newExpense._id);
      await user.save({ session });
    }

    await session.commitTransaction();

    const populatedExpense = await Expense.findById(newExpense._id).populate('creator', 'name email');
    
    res.status(201).json({ message: 'Expense created successfully', expense: populatedExpense });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to create expense', error: error.message });
  } finally {
    session.endSession();
  }
};

const updateExpense = async (req, res) => {
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
    isNonVat,
    noValidReceipt,
  } = req.body;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expense = await Expense.findById(id).session(session);
    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expense.seq = seq;
    expense.date = date;
    expense.description = description;
    expense.amount = amount;
    expense.isNonVat = isNonVat;
    expense.noValidReceipt = noValidReceipt;

    // Apply conditional updates based on noValidReceipt and isNonVat states
    if (noValidReceipt) {
      expense.supplierName = "N/A";
      expense.ref = "N/A";
      expense.tin = "N/A";
      expense.address = "N/A";
      expense.inputVAT = 0;
      expense.netOfVAT = 0;
      expense.isNonVat = false; // Reset isNonVat if noValidReceipt is true
    } else {
      expense.supplierName = supplierName;
      expense.ref = ref;
      expense.tin = tin;
      expense.address = address;
      expense.inputVAT = isNonVat || noValidReceipt ? 0 : inputVAT;
      expense.netOfVAT = isNonVat ? amount : netOfVAT;
    }

    await expense.save({ session });
    await session.commitTransaction();

    const populatedExpense = await Expense.findById(expense._id).populate('creator', 'name email');

    res.status(200).json({ message: 'Expense updated successfully', expense: populatedExpense });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to update expense', error: error.message });
  } finally {
    session.endSession();
  }
};

const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const expense = await Expense.findById(id).populate('creator').session(session);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    // Remove expense from user's expenses list if needed
    if (expense.creator && expense.creator.allExpenses) {
      expense.creator.allExpenses.pull(expense._id);
      await expense.creator.save({ session });
    }
    await Expense.findByIdAndDelete(id).session(session);
    await session.commitTransaction();
    res.status(200).json({ message: 'Expense deleted successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Failed to delete expense, please try again later', error: error.message });
  } finally {
    session.endSession();
  }
};

export {
  getAllExpenses,
  getExpenseDetail,
  createExpense,
  updateExpense,
  deleteExpense,
};
