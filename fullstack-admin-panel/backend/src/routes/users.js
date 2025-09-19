const express = require('express');
const router = express.Router();

// Mock users data
const mockUsers = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
  { id: 2, username: 'user', email: 'user@example.com', role: 'user' }
];

// GET /api/users - Get all users
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockUsers,
    message: 'Users retrieved successfully'
  });
});

// GET /api/users/:id - Get user by ID
router.get('/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = mockUsers.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found'
    });
  }

  res.json({
    success: true,
    data: user,
    message: 'User retrieved successfully'
  });
});

module.exports = router;