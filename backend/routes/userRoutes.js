const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Public routes
router.post('/register', userController.register);
router.post('/login', userController.login);

// Protected routes
router.use(protect);

// Admin only routes
router.get('/', authorize('admin'), userController.getAllUsers);
router.get('/:id', authorize('admin'), userController.getUserById);
router.put('/:id', authorize('admin'), userController.updateUser);
router.delete('/:id', authorize('admin'), userController.deleteUser);

module.exports = router; 