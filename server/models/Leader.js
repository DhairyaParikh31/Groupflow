import mongoose from 'mongoose';

const leaderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true }
  },
  anniversary: {
    type: Date
  },
  maritalStatus: {
    type: String,
    enum: ['Single', 'Married'],
    default: 'Single'
  },
  phoneNumber: {
    type: String,
    required: true
  },
  photo: {
    type: String
  },
  activeMembers: {
    type: Number,
    default: 0
  },
  totalMembers: {
    type: Number,
    default: 0
  },
  customFields: [{
    name: String,
    value: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Leader = mongoose.model('Leader', leaderSchema);