const Election = require('../models/election.model');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// Helper function to determine election status based on dates
const getElectionStatus = (startDate, endDate) => {
  const now = new Date();
  if (now < startDate) return 'upcoming';
  if (now > endDate) return 'ended';
  return 'running';
};

// Helper function to validate time gap
const validateTimeGap = (startDate, endDate) => {
  const MIN_TIME_GAP = 15 * 60 * 1000; // 15 minutes in milliseconds
  const timeDiff = endDate.getTime() - startDate.getTime();
  return timeDiff >= MIN_TIME_GAP;
};

// Helper function to handle image upload
const handleImageUpload = async (imageFile, candidateName) => {
  if (!imageFile) return null;
  return imageFile.filename; // Return the filename that multer generated
};

// Create a new election
exports.createElection = async (req, res) => {
  try {
    // Check if required fields exist
    if (!req.body.name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!req.body.startDate || !req.body.endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }

    const name = req.body.name.trim();
    const description = req.body.description;
    const type = req.body.type || 'open';
    
    // Parse dates
    let start, end;
    try {
      start = new Date(req.body.startDate);
      end = new Date(req.body.endDate);
      
      if (isNaN(start.getTime())) {
        return res.status(400).json({ message: 'Invalid start date format' });
      }
      if (isNaN(end.getTime())) {
        return res.status(400).json({ message: 'Invalid end date format' });
      }
    } catch (error) {
      return res.status(400).json({ message: 'Invalid date format', error: error.message });
    }

    // Validate dates
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Parse candidates
    let candidates = [];
    if (req.body.candidates) {
      try {
        candidates = typeof req.body.candidates === 'string' ? 
          JSON.parse(req.body.candidates) : req.body.candidates;
      } catch (error) {
        return res.status(400).json({ message: 'Invalid candidates format' });
      }
    }

    // Validate allowedVoters for restricted elections
    const allowedVoters = req.body.allowedVoters;
    if (type === 'restricted' && (!allowedVoters || !Array.isArray(allowedVoters) || allowedVoters.length === 0)) {
      return res.status(400).json({ message: 'Restricted elections must have at least one allowed voter' });
    }

    // Process candidates
    const processedCandidates = await Promise.all(candidates.map(async (candidate, index) => {
      if (!candidate.name) {
        throw new Error(`Candidate at index ${index} must have a name`);
      }

      let imageFilename = null;
      const fileKey = `candidates[${index}][image]`;
      const imageFile = req.files ? req.files.find(f => f.fieldname === fileKey) : null;
      if (imageFile) {
        imageFilename = await handleImageUpload(imageFile, candidate.name);
      }
      
      return {
        name: candidate.name,
        motto: candidate.motto || '',
        image: imageFilename
      };
    }));

    // Create voter status array for restricted elections
    const voterStatus = type === 'restricted' ? 
      allowedVoters.map(email => ({
        email,
        hasVoted: false
      })) : [];

    const election = new Election({
      name,
      description,
      candidates: processedCandidates,
      startDate: start,
      endDate: end,
      status: getElectionStatus(start, end),
      type,
      allowedVoters: type === 'restricted' ? allowedVoters : undefined,
      voterStatus
    });

    await election.save();
    res.status(201).json({ message: 'Election created successfully', election });
  } catch (error) {
    console.error('Election creation error:', error);
    res.status(500).json({ message: 'Error creating election', error: error.message });
  }
};

// Get all elections (filtered by voter email for restricted elections)
exports.getAllElections = async (req, res) => {
  try {
    const voterEmail = req.user.email;
    const userRole = req.user.role;
    const elections = await Election.find();

    // If user is admin, return all elections
    if (userRole === 'admin') {
      return res.json(elections);
    }

    // For voters, filter elections based on email and type
    const filteredElections = elections.filter(election => {
      if (election.type === 'open') return true;
      if (election.type === 'restricted') {
        return election.allowedVoters.includes(voterEmail);
      }
      return false;
    });

    // Add voter status to each election
    const electionsWithStatus = filteredElections.map(election => {
      const voterStatus = election.voterStatus.find(vs => vs.email === voterEmail);
      return {
        ...election.toObject(),
        hasVoted: voterStatus ? voterStatus.hasVoted : false
      };
    });

    res.json(electionsWithStatus);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching elections', error: error.message });
  }
};

// Get election by ID
exports.getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }
    
    // Update status based on current time
    const status = getElectionStatus(election.startDate, election.endDate);
    if (status !== election.status) {
      election.status = status;
      await election.save();
    }
    
    res.json(election);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching election', error: error.message });
  }
};

// Update election
exports.updateElection = async (req, res) => {
  try {
    const { name, description, candidates, startDate, endDate, type, allowedVoters } = req.body;
    const election = await Election.findById(req.params.id);
    
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Validate dates
    const start = startDate ? new Date(startDate) : election.startDate;
    const end = endDate ? new Date(endDate) : election.endDate;
    if (start >= end) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Validate allowedVoters for restricted elections
    if (type === 'restricted' && (!allowedVoters || !Array.isArray(allowedVoters) || allowedVoters.length === 0)) {
      return res.status(400).json({ message: 'Restricted elections must have at least one allowed voter' });
    }

    // Process candidates if provided
    let processedCandidates = election.candidates;
    if (candidates) {
      processedCandidates = await Promise.all(candidates.map(async (candidate) => {
        let imageFilename = null;
        if (req.files && req.files[candidate.name]) {
          imageFilename = await handleImageUpload(req.files[candidate.name], candidate.name);
        }
        return {
          name: candidate.name,
          motto: candidate.motto,
          image: imageFilename
        };
      }));
    }

    // Update election fields
    election.name = name || election.name;
    election.description = description || election.description;
    election.candidates = processedCandidates;
    election.startDate = start;
    election.endDate = end;
    election.status = getElectionStatus(start, end);
    election.type = type || election.type;
    
    // Update allowed voters and voter status if type is restricted
    if (type === 'restricted') {
      election.allowedVoters = allowedVoters;
      // Update voter status for new voters
      const existingEmails = election.voterStatus.map(vs => vs.email);
      const newVoters = allowedVoters.filter(email => !existingEmails.includes(email));
      election.voterStatus = [
        ...election.voterStatus,
        ...newVoters.map(email => ({ email, hasVoted: false }))
      ];
    }

    await election.save();
    res.json({ message: 'Election updated successfully', election });
  } catch (error) {
    res.status(500).json({ message: 'Error updating election', error: error.message });
  }
};

// Delete election
exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Delete the election
    await Election.findByIdAndDelete(req.params.id);
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting election', error: error.message });
  }
};

// Start election
exports.startElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status !== 'upcoming') {
      return res.status(400).json({ message: 'Election can only be started if it is upcoming' });
    }

    election.status = 'running';
    await election.save();
    res.json({ message: 'Election started successfully', election });
  } catch (error) {
    res.status(500).json({ message: 'Error starting election', error: error.message });
  }
};

// End election
exports.endElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status !== 'running') {
      return res.status(400).json({ message: 'Election can only be ended if it is running' });
    }

    election.status = 'ended';
    await election.save();
    res.json({ message: 'Election ended successfully', election });
  } catch (error) {
    res.status(500).json({ message: 'Error ending election', error: error.message });
  }
}; 