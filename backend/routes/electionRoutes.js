const express = require('express');
const router = express.Router();
const electionController = require('../controllers/electionController');
const voteController = require('../controllers/voteController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.get('/', protect, electionController.getAllElections);
router.get('/:id', protect, electionController.getElectionById);

// Admin only routes
router.post('/', protect, authorize('admin'), electionController.createElection);
router.put('/:id', protect, authorize('admin'), electionController.updateElection);
router.delete('/:id', protect, authorize('admin'), electionController.deleteElection);

// Election status management
router.post('/:id/start', protect, authorize('admin'), electionController.startElection);
router.post('/:id/end', protect, authorize('admin'), electionController.endElection);

// Delete election
router.delete('/elections/:electionId', voteController.deleteElection);

module.exports = router;