/* eslint-disable consistent-return */
/* eslint-disable no-underscore-dangle */
import User from '../mongodb/models/user.js';

export const getAllUsers = async (req, res) => {
  try {
    const { email } = req.query;
    let users;

    if (email) {
      // Fetch users by email if the email is provided
      users = await User.findOne({ email });  // Use findOne since email should be unique
    } else {
      // Fetch all users if no email query is provided
      users = await User.find({});
    }

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) return res.status(200).json(userExists);  // Return existing user if found

    const newUser = await User.create({
      name,
      email,
      avatar,
    });

    res.status(200).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong, failed to create user' });
  }
};

export const getUserInfoByID = async (req, res) => {
  try {
    const { id } = req.params;
    const userProperties = await User.findById(id).populate('allProperties');

    if (userProperties) {
      res.status(200).json(userProperties);
    } else {
      res.status(404).send('User not found');
    }
  } catch (err) {
    res.status(500).json({ message: 'Failed to get user properties, please try again later' });
  }
};