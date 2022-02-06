const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  campaignId: {
    type: sequelize.UUID,
    primaryKey: true
  },
  title: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  tagline: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  campaignDescription: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  moneyRequired: {
    type: sequelize.FLOAT,
    allowNull: true
  },
  ngoId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Ngos',
      key: 'ngoId'
    }
  }
}

const options = {
  timestamps: true
}
const Campaign = db.define('Campaign', schema, options)

module.exports = Campaign
