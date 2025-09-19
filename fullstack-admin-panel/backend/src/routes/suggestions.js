const express = require('express');
const router = express.Router();

// Mock suggestions data
const mockSuggestions = [
  { id: 1, title: 'Enable 2FA for all users', description: 'Improve security by enabling 2FA', status: 'pending' },
  { id: 2, title: 'Update password policy', description: 'Require stronger passwords', status: 'implemented' }
];

// GET /api/suggestions - Get all suggestions
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockSuggestions,
    message: 'Suggestions retrieved successfully'
  });
});

// POST /api/suggestions - Create new suggestion
router.post('/', (req, res) => {
  const { title, description } = req.body;

  if (!title || !description) {
    return res.status(400).json({
      success: false,
      message: 'Title and description are required'
    });
  }

  const newSuggestion = {
    id: mockSuggestions.length + 1,
    title,
    description,
    status: 'pending'
  };

  mockSuggestions.push(newSuggestion);

  res.status(201).json({
    success: true,
    data: newSuggestion,
    message: 'Suggestion created successfully'
  });
});

module.exports = router;