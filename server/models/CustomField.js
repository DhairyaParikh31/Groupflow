import mongoose from 'mongoose';

const customFieldSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  fieldType: {
    type: String,
    enum: ['text', 'number', 'date', 'time', 'email'],
    default: 'text'
  },
  defaultValue: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const CustomField = mongoose.model('CustomField', customFieldSchema);