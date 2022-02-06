const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  userId: {
    type: sequelize.UUID,
    primaryKey: true
  },
  userName: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  email: {
    type: sequelize.STRING(255),
    allowNull: true,
    isEmail: true
  },
  userProfileUrl: {
    type: sequelize.STRING(255),
    isUrl: true,
    allowNull: true
  },
  credits: {
    type: sequelize.FLOAT,
    defaultValue: 5000.0
  }
}

const options = {
  timestamps: true
}
const User = db.define('User', schema, options)
module.exports = User
