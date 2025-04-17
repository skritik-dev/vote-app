const Vote = require('../models/vote.model');
const Election = require('../models/election.model');
const { encryptVote, decryptVote } = require('../utils/cryptoUtils');

// 🔹 Cast a vote
exports.castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body
    const voterEmail = req.user.email

    // Check if election exists
    const election = await Election.findById(electionId)
    if (!election) {
      return res.status(404).json({ message: 'Election not found' })
    }

    // Check if election is running
    if (election.status !== 'running') {
      return res.status(400).json({ message: 'Election is not currently running' })
    }

    // Check if candidate exists in the election
    const candidateExists = election.candidates.some(c => c._id.toString() === candidateId)
    if (!candidateExists) {
      return res.status(400).json({ message: 'Invalid candidate for this election' })
    }

    // Check if voter has already voted
    const existingVote = await Vote.findOne({
      electionId,
      voterEmail
    })
    
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' })
    }

    // Encrypt the vote
    const { encryptedData, iv } = encryptVote(candidateId);

    // Create new vote with encrypted data
    const vote = new Vote({
      electionId,
      voterEmail,
      encryptedVote: encryptedData,
      iv
    })

    await vote.save()

    // Update voter status in election
    const voterStatus = election.voterStatus.find(vs => vs.email === voterEmail)
    if (voterStatus) {
      voterStatus.hasVoted = true
      voterStatus.votedAt = new Date()
      await election.save()
    }

    res.status(201).json({ message: 'Vote cast successfully' })
  } catch (error) {
    console.error('Error casting vote:', error)
    res.status(500).json({ message: 'Error casting vote' })
  }
}

// 🔹 Get election results
exports.getElectionResults = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);

    if (!election) return res.status(404).json({ message: 'Election not found' });
    if (election.status !== 'ended') {
      return res.status(403).json({ message: 'Results are not yet available for this election' });
    }

    const votes = await Vote.find({ electionId });

    // Count votes by decrypting encryptedVote
    const voteCounts = {};
    votes.forEach(vote => {
      if (vote.encryptedVote && vote.iv) {
        try {
          const decryptedCandidateId = decryptVote(vote.encryptedVote, vote.iv);
          voteCounts[decryptedCandidateId] = (voteCounts[decryptedCandidateId] || 0) + 1;
        } catch (err) {
          console.error('Error decrypting vote:', err);
        }
      }
    });

    const results = election.candidates.map(candidate => ({
      candidateId: candidate._id,
      name: candidate.name,
      votes: voteCounts[candidate._id.toString()] || 0,
    }));

    res.json(results);
  } catch (error) {
    console.error('Error getting election results:', error);
    res.status(500).json({ message: 'Error getting election results', error: error.message });
  }
};

// 🔹 Admin: View all votes of an election
exports.getElectionVotes = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const votes = await Vote.find({ electionId });
    res.json(votes);
  } catch (error) {
    console.error('Error fetching votes:', error);
    res.status(500).json({ message: 'Error fetching votes', error: error.message });
  }
};

// 🔹 Get total number of votes for an election
exports.getVoteCount = async (req, res) => {
  try {
    const { electionId } = req.params;
    const election = await Election.findById(electionId);
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const count = await Vote.countDocuments({ electionId });
    res.json({ voteCount: count });
  } catch (error) {
    console.error('Error fetching vote count:', error);
    res.status(500).json({ message: 'Error fetching vote count', error: error.message });
  }
};

// 🔹 Admin: Delete all votes for an election
exports.deleteElection = async (req, res) => {
  try {
    const { electionId } = req.params;
    // Delete all votes related to the election
    await Vote.deleteMany({ electionId });
    res.status(200).json({ message: 'All votes for the election have been deleted' });
  } catch (error) {
    console.error('Error deleting election votes:', error);
    res.status(500).json({ message: 'Error deleting election votes' });
  }

// 🔹 Admin: Delete an election
exports.deleteElection = async (req, res) => {
  try {
    const { electionId } = req.params;

    // Find and delete the election
    const election = await Election.findByIdAndDelete(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Optionally, delete associated votes
    await Vote.deleteMany({ electionId });

    res.status(200).json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Error deleting election:', error);
    res.status(500).json({ message: 'Error deleting election', error: error.message });
  }
}
};