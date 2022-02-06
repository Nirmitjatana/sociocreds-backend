const sequelize = require('sequelize')
const db = require('../database/connection')

const schema = {
  shopId: {
    type: sequelize.UUID,
    primaryKey: true
  },
  shopName: {
    type: sequelize.STRING(255),
    allowNull: true
  },
  shopAddress: {
    type: sequelize.STRING(255),
    allowNull: true
  }
}

const options = {
  timestamps: true
}
const Shop = db.define('Shop', schema, options)

module.exports = Shop
