const admin = require('../firebase/firebase')
const logger = require('../logging/logger')
const uuid4 = require('uuid4')
const User = require('../models/users')
const jwt = require('jsonwebtoken')
const Donation = require('../models/donation')
const Points = require('../models/points')
const Shop = require('../models/shop')
const Ngo = require('../models/ngo')
const Campaign = require('../models/campaign')
const Post = require('../models/post')
const { Sequelize } = require('sequelize')
const { Op } = require('sequelize')

class UserController {
  static async login (idToken) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken)
      const exists = await User.findOne({ where: { email: decoded.email } })
      if (exists) {
        const token = jwt.sign({
          id: exists.userId
        }, process.env.SECRET_KEY)
        return {
          error: false,
          code: 200,
          message: 'User Logged In',
          data: exists,
          jwt: token
        }
      }
      const user = {
        userId: uuid4(),
        userName: decoded.name,
        email: decoded.email,
        userProfileUrl: decoded.picture
      }
      const createdUser = await User.create(user)
      const token = jwt.sign({
        id: createdUser.userId
      }, process.env.SECRET_KEY)
      return {
        error: false,
        code: 201,
        message: 'User Created',
        data: createdUser,
        jwt: token
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

  static async getDetails (userId) {
    try {
      const userDetails = await User.findOne({ where: { userId: userId } })
      if (!userDetails) {
        return {
          error: true,
          code: 404,
          message: 'No such user exists'
        }
      }
      return {
        error: false,
        code: 200,
        message: 'User Details Fetched',
        data: userDetails
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

  

  static async GetCampaigns () {
    try {
      const campaigns = await Campaign.findAll({
        include: [{ model: Ngo, attributes: ['ngoName'] }],
        order: [['createdAt', 'DESC']]
      })
      const donations = await Donation.findAll({
        where: { campaignId: { [Op.ne]: null } },
        attributes: ['campaignId', [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount']],
        group: ['Donation.campaignId']
      })
      const v = {}
      for (const i of donations) {
        v[i.campaignId] = i.amount
      }
      console.log(v)
      const d = campaigns.map(e => {
        let amt
        if (!v[e.campaignId]) {
          amt = 0
        } else {
          amt = v[e.campaignId]
        }
        return {
          ngoName: e.Ngo.ngoName,
          tagline: e.tagline,
          moneyRequired: e.moneyRequired,
          raisedAmount: amt
        }
      })
      return {
        code: 201,
        data: d
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

  static async GetPosts () {
    try {
      const posts = await Post.findAll()
      return {
        error: false,
        code: 200,
        data: posts,
        message: 'Posts fetched'
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

module.exports = UserController
