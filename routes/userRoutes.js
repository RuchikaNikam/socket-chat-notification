const express = require('express');
const router = express.Router();
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Route to get all users
router.get('/', authMiddleware, getUsers);

// Route to get a specific user
router.get('/:id', authMiddleware, getUserById);

// Route to update a user
router.put('/:id', authMiddleware, updateUser);

// Route to delete a user
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
