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

  static async getTransactions (userId) {
    try {
      const donations = await Donation.findAll({
        where: { userId: userId },
        include: [{ model: Ngo, attributes: ['ngoName'] }],
        order: [['createdAt', 'DESC']]
      })
      const points = await Points.findAll({
        where: { userId: userId },
        include: [{ model: Shop, attributes: ['shopName', 'shopAddress'] }],
        order: [['createdAt', 'DESC']]
      })

      return {
        code: 200,
        error: false,
        donations,
        points
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

  static async GetRecent (userId) {
    try {
      const donations = await Donation.findAll({
        where: { userId: userId },
        include: [{ model: Ngo, attributes: ['ngoName'] }],
        limit: 5,
        order: [['createdAt', 'DESC']]
      })
      const points = await Points.findAll({
        where: { userId: userId },
        include: [{ model: Shop, attributes: ['shopName', 'shopAddress'] }],
        limit: 5,
        order: [['createdAt', 'DESC']]
      })

      const d = donations.map(e => {
        return {
          name: e.Ngo.ngoName,
          desc: e.description,
          amount: e.amount,
          positive: false,
          ts: new Date(e.createdAt)
        }
      })

      const p = points.map(e => {
        return {
          name: e.Shop.shopName,
          desc: e.Shop.shopAddress,
          amount: e.amount,
          positive: true,
          ts: new Date(e.createdAt)
        }
      })
      const final = [
        ...p,
        ...d
      ]

      final.sort((a, b) => {
        if (a > b) { return -1 } else { return 1 }
      })

      return {
        code: 200,
        error: false,
        message: 'fetched recent transactions',
        data: final
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

  static async LeaderBoard () {
    try {
      const mostDonations = await Donation.findAll({
        where: { userId: { [Op.ne]: null } },
        attributes: ['User.userId', [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount']],
        group: ['User.userId'],
        include: [{ model: User, attributes: ['userName'] }],
        order: [[Sequelize.fn('SUM', Sequelize.col('Donation.amount')), 'DESC']],
        limit: 5
      })
      const recentDonations = await Donation.findAll({
        where: { userId: { [Op.ne]: null } },
        attributes: ['User.userId', 'amount', 'createdAt'],
        include: [{ model: User, attributes: ['userName'] }],
        order: [['createdAt', 'DESC']],
        limit: 5
      })
      return {
        code: 200,
        message: 'fetched donations',
        error: false,
        recentDonations,
        mostDonations
      }
    } catch (err) {
      console.log(err)
      return {
        error: true,
        code: 500,
        message: err.toString()
      }
    }
  }
}

module.exports = UserController
