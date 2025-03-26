import mongoose from 'mongoose';

const sharedInformationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    filename: String,
    contentType: String,
    data: Buffer,
    size: Number
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const SharedInformation = mongoose.model('SharedInformation', sharedInformationSchema);