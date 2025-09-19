const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AuditLog = sequelize.define('AuditLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['create', 'update', 'delete', 'login', 'logout', 'approve', 'reject', 'enable_2fa', 'disable_2fa', 'settings_change']]
    }
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['user', 'tool', 'suggestion', 'settings', 'auth']]
    }
  },
  entity_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  details: {
    type: DataTypes.JSON,
    allowNull: true
  },
  ip_address: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user_agent: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  session_id: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'audit_logs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false,
  deletedAt: false,
  indexes: [
    {
      fields: ['user_id']
    },
    {
      fields: ['action']
    },
    {
      fields: ['entity']
    },
    {
      fields: ['entity_id']
    },
    {
      fields: ['created_at']
    }
  ]
});

// Static method for logging actions
AuditLog.logAction = async function(userId, action, entity, entityId = null, details = null, req = null) {
  const logData = {
    user_id: userId,
    action,
    entity,
    entity_id: entityId,
    details
  };

  if (req) {
    logData.ip_address = req.ip || req.connection.remoteAddress;
    logData.user_agent = req.get('User-Agent');
    logData.session_id = req.sessionID;
  }

  try {
    return await this.create(logData);
  } catch (error) {
    console.error('Error creating audit log:', error);
    // Don't throw error to prevent audit logging from breaking main functionality
    return null;
  }
};

module.exports = AuditLog;