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
  clientName: {
    type: String,
    required: true,
  },
  tin: {
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
  outputVAT: {
    type: Number,
    required: true,
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const expenseModel = mongoose.model('Expenses', ExpenseSchema);

export default expenseModel;