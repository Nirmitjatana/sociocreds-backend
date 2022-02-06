const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  pointsId: {
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
  shopId: {
    type: sequelize.UUID,
    allowNull: false,
    references: {
      model: 'Shops',
      key: 'shopId'
    }
  },
  amount: {
    type: sequelize.FLOAT,
    allowNull: false
  }
}

const options = {
  timestamps: true
}
const Points = db.define('Points', schema, options)

module.exports = Points
