const User = require('../models/users')
const Donations = require('../models/donation')
const Campaign = require('../models/campaign')
const Ngo = require('../models/ngo')
const uuid4 = require('uuid4')
const logger = require('../logging/logger')
const { Sequelize } = require('sequelize')
class DonationController {
  static async donateRandomNGO (userId, campaignId, amount, description) {
    if ((amount > 0) || !description) {
      const usr = await User.findOne({ where: { userId: userId } })
      try {
        if (usr.credits < amount) {
          return {
            code: 400,
            message: "User doesn't have enough credits",
            error: true
          }
        }
        if (campaignId) {
          logger.info(userId)
          const cpgn = await Campaign.findOne({ where: { campaignId } })
          const d = {
            donationId: uuid4(),
            userId: userId,
            ngoId: cpgn.ngoId,
            campaignId,
            amount,
            description
          }
          const result = await Donations.create(d)
          await User.update({
            credits: usr.credits - amount
          }, { where: { userId } })
          return {
            code: 201,
            error: false,
            message: 'donation recorder',
            data: result
          }
        } else {
          const ngo = await Ngo.findOne({
            order: [
              Sequelize.fn('RANDOM')
            ]
          })
          const d = {
            donationId: uuid4(),
            userId,
            ngoId: ngo.ngoId,
            amount,
            description
          }
          const result = await Donations.create(d)
          await User.update({
            credits: usr.credits - amount
          }, { where: { userId } })
          return {
            code: 201,
            error: false,
            message: 'donation recorder',
            data: result
          }
        }
      } catch (err) {
        logger.error(err.toString())
        return {
          code: 500,
          error: true,
          message: err.toString()
        }
      }
    } else {
      return {
        code: 400,
        error: false,
        message: 'amount must be more than 0'
      }
    }
  }
}
module.exports = DonationController
