import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    pincode: String
  },
  anniversary: {
    type: Date
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married'],
    required: true,
    default: 'Single'
  },
  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  status: {
    type: String,
    enum: ['Active', 'Moderate', 'Inactive'],
    default: 'Active'
  },
  photo: {
    type: String // URL to the stored image
  },
  customFields: [{
    name: String,
    value: String
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export const Member = mongoose.model('Member', memberSchema);