const Shop = require('../models/shop')
const User = require('../models/users')
const Point = require('../models/points')
const logger = require('../logging/logger')
const uuid4 = require('uuid4')

class ShopController {
  static async createShop (shopName, shopAddress) {
    try {
      const shop = {
        shopId: uuid4(),
        shopName,
        shopAddress
      }
      const createdShop = await Shop.create(shop)
      return {
        error: false,
        code: 201,
        message: 'Shop Created',
        data: createdShop
      }
    } catch (err) {
      logger.error(err.toString())
      return {
        error: true,
        code: 500,
        message: err.toString()
      }
    }
  }

  static async getShopDetails (shopId) {
    try {
      const createdShop = await Shop.findOne({ where: { shopId } })
      if (!createdShop) {
        return {
          error: true,
          code: 404,
          message: 'No such shop exists'
        }
      }
      return {
        error: false,
        code: 200,
        message: 'Shop Details Fetched',
        data: createdShop
      }
    } catch (err) {
      logger.error(err.toString())
      return {
        error: true,
        code: 500,
        message: err.toString()
      }
    }
  }

  static async sendPoints (shopId, userId, amount) {
    try {
      const points = {
        pointsId: uuid4(),
        shopId,
        userId,
        amount
      }
      const createdPoint = await Point.create(points)
      await User.increment('credits', { by: amount, where: { userId } })
      return {
        error: false,
        code: 200,
        message: 'Points Credited',
        data: createdPoint
      }
    } catch (err) {
      logger.error(err.toString())
      return {
        error: true,
        code: 500,
        message: err.toString()
      }
    }
  }
}

module.exports = ShopController
