const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const AppSetting = sequelize.define('AppSetting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 100]
    }
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('string', 'number', 'boolean', 'json'),
    defaultValue: 'string',
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'general',
    allowNull: false
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  updated_by: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'app_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: false,
  indexes: [
    {
      fields: ['key'],
      unique: true
    },
    {
      fields: ['category']
    }
  ]
});

// Instance methods
AppSetting.prototype.getParsedValue = function() {
  try {
    switch (this.type) {
      case 'boolean':
        return this.value === 'true' || this.value === '1';
      case 'number':
        return parseFloat(this.value);
      case 'json':
        return JSON.parse(this.value);
      default:
        return this.value;
    }
  } catch (error) {
    console.error(`Error parsing setting ${this.key}:`, error);
    return this.value;
  }
};

AppSetting.prototype.setParsedValue = function(value) {
  try {
    switch (this.type) {
      case 'boolean':
        this.value = value ? 'true' : 'false';
        break;
      case 'number':
        this.value = value.toString();
        break;
      case 'json':
        this.value = JSON.stringify(value);
        break;
      default:
        this.value = value.toString();
    }
  } catch (error) {
    console.error(`Error setting value for ${this.key}:`, error);
    this.value = value.toString();
  }
};

// Static methods
AppSetting.getSetting = async function(key, defaultValue = null) {
  try {
    const setting = await this.findOne({ where: { key } });
    return setting ? setting.getParsedValue() : defaultValue;
  } catch (error) {
    console.error(`Error getting setting ${key}:`, error);
    return defaultValue;
  }
};

AppSetting.setSetting = async function(key, value, updatedBy = null, options = {}) {
  try {
    const { type = 'string', description = null, category = 'general', isPublic = false } = options;

    const [setting, created] = await this.findOrCreate({
      where: { key },
      defaults: {
        key,
        value: '',
        type,
        description,
        category,
        is_public: isPublic,
        updated_by: updatedBy
      }
    });

    setting.setParsedValue(value);
    setting.updated_by = updatedBy;
    await setting.save();

    return setting;
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
};

AppSetting.getPublicSettings = async function() {
  try {
    const settings = await this.findAll({
      where: { is_public: true },
      attributes: ['key', 'value', 'type']
    });

    const result = {};
    settings.forEach(setting => {
      result[setting.key] = setting.getParsedValue();
    });

    return result;
  } catch (error) {
    console.error('Error getting public settings:', error);
    return {};
  }
};

module.exports = AppSetting;