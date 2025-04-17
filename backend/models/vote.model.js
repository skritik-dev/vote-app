const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  voterEmail: { type: String, required: true }, // original voter email
  encryptedVote: { type: String, required: true }, // encrypted vote data
  iv: { type: String, required: true } // initialization vector for decryption
}, { timestamps: true });

voteSchema.index({ electionId: 1, voterEmail: 1 }, { unique: true }); // prevent double voting

module.exports = mongoose.model('Vote', voteSchema);