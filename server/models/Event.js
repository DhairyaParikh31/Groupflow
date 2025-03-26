import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  venue: {
    type: String,
    required: true
  },
  time: {
    start: {
      type: String,
      required: true
    },
    end: {
      type: String,
      required: true
    }
  },
  information: {
    type: String,
    required: true
  },
  leaders: [{
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    memberCount: {
      type: String
    }
  }],
  attendees: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member'
    },
    attended: {
      type: Boolean,
      default: false
    },
    reason: {
      type: String,
      default: ''
    }
  }],
  isCompleted: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Event = mongoose.model('Event', eventSchema);