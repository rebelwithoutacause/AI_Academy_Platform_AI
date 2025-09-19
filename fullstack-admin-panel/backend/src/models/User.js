const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [2, 100]
    }
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password_hash: {
    type: DataTypes.STRING,
    allowNull: false
  },
  role: {
    type: DataTypes.ENUM('user', 'moderator', 'admin'),
    defaultValue: 'user',
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  // 2FA fields
  two_fa_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  two_fa_method: {
    type: DataTypes.ENUM('email', 'telegram', 'totp'),
    allowNull: true
  },
  two_fa_secret: {
    type: DataTypes.STRING,
    allowNull: true
  },
  telegram_chat_id: {
    type: DataTypes.STRING,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  login_attempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  locked_until: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

// Instance methods
User.prototype.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password_hash);
};

User.prototype.isLocked = function() {
  return this.locked_until && this.locked_until > new Date();
};

User.prototype.incrementLoginAttempts = async function() {
  if (this.locked_until && this.locked_until < new Date()) {
    return this.update({
      login_attempts: 1,
      locked_until: null
    });
  }

  const updates = { login_attempts: this.login_attempts + 1 };

  // Lock account after 5 failed attempts for 30 minutes
  if (this.login_attempts + 1 >= 5 && !this.isLocked()) {
    updates.locked_until = new Date(Date.now() + 30 * 60 * 1000);
  }

  return this.update(updates);
};

User.prototype.resetLoginAttempts = async function() {
  return this.update({
    login_attempts: 0,
    locked_until: null,
    last_login: new Date()
  });
};

// Class methods
User.hashPassword = async function(password) {
  return await bcrypt.hash(password, 12);
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password_hash;
  delete values.two_fa_secret;
  return values;
};

module.exports = User;