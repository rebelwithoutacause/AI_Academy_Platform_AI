const { sequelize } = require('../config/database');

// Import models
const User = require('./User');
const Tool = require('./Tool');
const Suggestion = require('./Suggestion');
const AuditLog = require('./AuditLog');
const AppSetting = require('./AppSetting');

// Define associations
// User associations
User.hasMany(Tool, {
  foreignKey: 'created_by',
  as: 'createdTools'
});

User.hasMany(Tool, {
  foreignKey: 'approved_by',
  as: 'approvedTools'
});

User.hasMany(Suggestion, {
  foreignKey: 'proposer_id',
  as: 'suggestions'
});

User.hasMany(Suggestion, {
  foreignKey: 'reviewed_by',
  as: 'reviewedSuggestions'
});

User.hasMany(AuditLog, {
  foreignKey: 'user_id',
  as: 'auditLogs'
});

User.hasMany(AppSetting, {
  foreignKey: 'updated_by',
  as: 'updatedSettings'
});

// Tool associations
Tool.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator'
});

Tool.belongsTo(User, {
  foreignKey: 'approved_by',
  as: 'approver'
});

// Suggestion associations
Suggestion.belongsTo(User, {
  foreignKey: 'proposer_id',
  as: 'proposer'
});

Suggestion.belongsTo(User, {
  foreignKey: 'reviewed_by',
  as: 'reviewer'
});

// AuditLog associations
AuditLog.belongsTo(User, {
  foreignKey: 'user_id',
  as: 'user'
});

// AppSetting associations
AppSetting.belongsTo(User, {
  foreignKey: 'updated_by',
  as: 'updatedByUser'
});

// Export models and sequelize instance
const models = {
  User,
  Tool,
  Suggestion,
  AuditLog,
  AppSetting,
  sequelize
};

// Sync database (only in development)
const syncDatabase = async (force = false) => {
  try {
    await sequelize.sync({ force, alter: !force });
    console.log('✅ Database synced successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error);
    throw error;
  }
};

module.exports = { ...models, syncDatabase };