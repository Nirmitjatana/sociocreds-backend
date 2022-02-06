const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  ngoId: {
    type: sequelize.UUID,
    primaryKey: true
  },
  ngoName: {
    type: sequelize.STRING(255),
    defaultValue: ''
  },
  email: {
    type: sequelize.STRING(255),
    allowNull: true,
    isEmail: true
  },
  profileUrl: {
    type: sequelize.STRING(255),
    isUrl: true,
    allowNull: true
  },
  ngoDescription: {
    type: sequelize.STRING(255),
    defaultValue: ''
  }
}

const options = {
  timestamps: true
}
const Ngo = db.define('Ngo', schema, options)

module.exports = Ngo
