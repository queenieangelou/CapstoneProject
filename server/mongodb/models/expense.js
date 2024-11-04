// server\mongodb\models\expense.js
import mongoose from 'mongoose';

const ExpenseSchema = new mongoose.Schema({
  seq: {
    type: Number,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  supplierName: {
    type: String,
    required: true,
  },
  ref: {
    type: String,
    required: true,
  },
  tin: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  netOfVAT: {
    type: Number,
    required: true,
  },
  inputVAT: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  net: {
    type: Number,
    required: true,
  },
  isNonVat: {
    type: Boolean,
    required: true,
  },
  noValidReceipt: {
    type: Boolean,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const expenseModel = mongoose.model('Expense', ExpenseSchema);

export default expenseModel;