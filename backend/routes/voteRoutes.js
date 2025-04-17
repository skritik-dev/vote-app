const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const { protect, authorize } = require('../middleware/auth');

// Protected routes
router.use(protect);

// Voter routes
router.post('/', voteController.castVote);
router.get('/election/:electionId/count', voteController.getVoteCount);
router.get('/election/:electionId/results', voteController.getElectionResults);

// Admin only routes
router.get('/election/:electionId', authorize('admin'), voteController.getElectionVotes);

module.exports = router; 