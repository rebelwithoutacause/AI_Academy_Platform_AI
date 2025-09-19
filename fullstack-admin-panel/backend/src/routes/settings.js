const express = require('express');
const router = express.Router();

// Mock settings data
const mockSettings = {
  maintenance_mode: false,
  max_login_attempts: 5,
  session_timeout: 24,
  require_2fa: false,
  password_min_length: 8,
  password_require_uppercase: true,
  password_require_numbers: true,
  password_require_symbols: false
};

// GET /api/settings - Get all settings
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockSettings,
    message: 'Settings retrieved successfully'
  });
});

// PUT /api/settings - Update settings
router.put('/', (req, res) => {
  const updates = req.body;

  // Update only valid settings
  Object.keys(updates).forEach(key => {
    if (mockSettings.hasOwnProperty(key)) {
      mockSettings[key] = updates[key];
    }
  });

  res.json({
    success: true,
    data: mockSettings,
    message: 'Settings updated successfully'
  });
});

// GET /api/settings/:key - Get specific setting
router.get('/:key', (req, res) => {
  const { key } = req.params;

  if (!mockSettings.hasOwnProperty(key)) {
    return res.status(404).json({
      success: false,
      message: 'Setting not found'
    });
  }

  res.json({
    success: true,
    data: { [key]: mockSettings[key] },
    message: 'Setting retrieved successfully'
  });
});

module.exports = router;