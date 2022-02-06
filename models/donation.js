const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  donationId: {
    type: sequelize.UUID,
    primaryKey: true
  },
  userId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'userId'
    }
  },
  ngoId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Ngos',
      key: 'ngoId'
    }
  },
  campaignId: {
    type: sequelize.UUID,
    allowNull: true,
    references: {
      model: 'Campaigns',
      key: 'campaignId'
    }
  },
  amount: {
    type: sequelize.FLOAT,
    allowNull: false
  },
  description: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  proofVideoUrl: {
    type: sequelize.STRING(255),
    allowNull: true
  }
}

const options = {
  timestamps: true
}
const Donations = db.define('Donation', schema, options)

module.exports = Donations
