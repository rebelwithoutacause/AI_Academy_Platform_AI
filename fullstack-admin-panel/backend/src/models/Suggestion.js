const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Suggestion = sequelize.define('Suggestion', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  proposer_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [10, 5000]
    }
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isIn: [['development', 'design', 'testing', 'deployment', 'analytics', 'security', 'productivity', 'other']]
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
    allowNull: false
  },
  url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  documentation_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  tags: {
    type: DataTypes.JSON,
    defaultValue: []
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  review_notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: 'suggestions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at',
  indexes: [
    {
      fields: ['proposer_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['category']
    },
    {
      fields: ['reviewed_by']
    }
  ]
});

// Instance methods
Suggestion.prototype.approve = async function(reviewerId, notes = null) {
  return this.update({
    status: 'approved',
    reviewed_by: reviewerId,
    reviewed_at: new Date(),
    review_notes: notes
  });
};

Suggestion.prototype.reject = async function(reviewerId, reason, notes = null) {
  return this.update({
    status: 'rejected',
    reviewed_by: reviewerId,
    reviewed_at: new Date(),
    rejection_reason: reason,
    review_notes: notes
  });
};

module.exports = Suggestion;