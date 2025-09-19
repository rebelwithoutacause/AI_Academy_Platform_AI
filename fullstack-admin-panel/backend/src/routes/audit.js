const express = require('express');
const router = express.Router();

// Mock audit logs data
const mockAuditLogs = [
  {
    id: 1,
    action: 'login',
    user: 'admin@example.com',
    timestamp: new Date().toISOString(),
    ip: '127.0.0.1',
    details: 'Successful login with 2FA'
  },
  {
    id: 2,
    action: '2fa_enabled',
    user: 'user@example.com',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    ip: '127.0.0.1',
    details: 'Enabled email 2FA'
  }
];

// GET /api/audit - Get audit logs
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: mockAuditLogs,
    message: 'Audit logs retrieved successfully'
  });
});

// POST /api/audit - Create audit log entry
router.post('/', (req, res) => {
  const { action, user, ip, details } = req.body;

  if (!action || !user) {
    return res.status(400).json({
      success: false,
      message: 'Action and user are required'
    });
  }

  const newLog = {
    id: mockAuditLogs.length + 1,
    action,
    user,
    timestamp: new Date().toISOString(),
    ip: ip || 'unknown',
    details: details || ''
  };

  mockAuditLogs.push(newLog);

  res.status(201).json({
    success: true,
    data: newLog,
    message: 'Audit log created successfully'
  });
});

module.exports = router;