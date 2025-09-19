const express = require('express');
const router = express.Router();

// Mock tools data
const mockTools = [
  { id: 1, name: 'User Management', description: 'Manage users and permissions', status: 'active' },
  { id: 2, name: '2FA Settings', description: 'Configure two-factor authentication', status: 'active' },
  { id: 3, name: 'Analytics', description: 'View system analytics', status: 'active' }
];

// GET /api/tools - Get all tools
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockTools,
    message: 'Tools retrieved successfully'
  });
});

// GET /api/tools/:id - Get tool by ID
router.get('/:id', (req, res) => {
  const toolId = parseInt(req.params.id);
  const tool = mockTools.find(t => t.id === toolId);

  if (!tool) {
    return res.status(404).json({
      success: false,
      message: 'Tool not found'
    });
  }

  res.json({
    success: true,
    data: tool,
    message: 'Tool retrieved successfully'
  });
});

module.exports = router;