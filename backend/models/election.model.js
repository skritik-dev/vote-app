const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  motto: String,
  image: String
});

const voterStatusSchema = new mongoose.Schema({
  email: { type: String, required: true },
  hasVoted: { type: Boolean, default: false },
  votedAt: { type: Date }
});

const electionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  candidates: [candidateSchema], 
  status: { type: String, enum: ['upcoming', 'running', 'ended'], default: 'upcoming' },
  startDate: { type: Date },
  endDate: { type: Date },
  type: { 
    type: String, 
    enum: ['open', 'restricted'], 
    default: 'open',
    required: true 
  },
  allowedVoters: [{ 
    type: String,
    required: function() {
      return this.type === 'restricted';
    }
  }],
  voterStatus: [voterStatusSchema],
  resultsVisible: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Election', electionSchema);
