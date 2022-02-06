const logger = require('../logging/logger')
const uuid4 = require('uuid4')
const Ngo = require('../models/ngo')
const Campaign = require('../models/campaign')
const Donation = require('../models/donation')
const Post = require('../models/post')
const jwt = require('jsonwebtoken')
const admin = require('../firebase/firebase')
const { Sequelize } = require('sequelize')
const { Op } = require('sequelize')
const User = require('../models/users')

class NgoController {
  static async login (idToken) {
    try {
      const decoded = await admin.auth().verifyIdToken(idToken)
      const exists = await Ngo.findOne({ where: { email: decoded.email } })
      if (exists) {
        const token = jwt.sign({
          id: exists.ngoId
        }, process.env.SECRET_KEY)
        return {
          error: false,
          code: 200,
          firstLogin: exists.ngoName === '',
          message: 'Ngo Logged In',
          data: exists,
          jwt: token
        }
      }
      const ngo = {
        ngoId: uuid4(),
        email: decoded.email,
        profileUrl: decoded.picture
      }
      const createdNgo = await Ngo.create(ngo)
      const token = jwt.sign({
        id: createdNgo.ngoId
      }, process.env.SECRET_KEY)
      return {
        error: false,
        code: 201,
        firstLogin: true,
        message: 'Ngo Created',
        data: createdNgo,
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

  static async getDetails (ngoId) {
    try {
      const ngoDetails = await Ngo.findOne({ where: { ngoId: ngoId } })
      if (!ngoDetails) {
        return {
          error: true,
          code: 404,
          message: 'No such ngo exists'
        }
      }
      return {
        error: false,
        code: 200,
        message: 'Ngo Details Fetched',
        data: ngoDetails
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

  static async updateDetails (ngoId, ngoName, ngoDescription) {
    try {
      const exists = await Ngo.findOne({ where: { ngoId: ngoId } })
      if (!exists) {
        return {
          error: true,
          code: 404,
          message: 'No such ngo exists'
        }
      }
      await Ngo.update({
        ngoName: ngoName,
        ngoDescription: ngoDescription
      }, { where: { ngoId: ngoId } })
      return {
        error: false,
        code: 200,
        message: 'Ngo Details Updated'
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

  static async createCampaign (ngoId, tagline, campaignDescription, moneyRequired, title) {
    try {
      const campaign = {
        campaignId: uuid4(),
        ngoId,
        tagline,
        campaignDescription,
        moneyRequired,
        title
      }
      const newCampaign = await Campaign.create(campaign)
      return {
        error: true,
        message: 'Campaign Created',
        code: 201,
        data: newCampaign
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

  static async createPost (ngoId, postTitle, postDescription, postPhotoUrl) {
    try {
      const post = {
        postId: uuid4(),
        ngoId,
        postTitle,
        postDescription,
        postPhotoUrl
      }
      const newPost = await Post.create(post)
      return {
        error: true,
        message: 'Post Created',
        code: 201,
        data: newPost
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

  static async fetchPost (ngoId) {
    try {
      const posts = await Post.findAll({ where: { ngoId } })
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

  static async fetchCampaigns (ngoId) {
    try {
      const campaigns = await Campaign.findAll({ where: { ngoId } })
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
          campaignId: e.campaignId,
          description: e.description,
          title: e.title,
          tagline: e.tagline,
          moneyRequired: e.moneyRequired,
          raisedAmount: amt,
          createdAt: e.createdAt,
          updatedAt: e.updatedAt
        }
      })
      return {
        error: false,
        code: 200,
        data: d,
        message: 'Campaigns fetched'
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

  static async proofUpload (proofVideoUrl, donationIds) {
    try {
      await Donation.update({ proofVideoUrl }, { where: { donationId: donationIds } })
      return {
        error: false,
        code: 200,
        message: 'Uploaded Proof'
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

  static async totalDonationsOfNGO (ngoId) {
    try {
      const donations = await Donation.findOne({
        attributes: ['ngoId', [Sequelize.fn('SUM', Sequelize.col('amount')), 'amount'], [Sequelize.fn('COUNT', Sequelize.col('amount')), 'count']],
        group: ['ngoId'],
        having: { ngoId: ngoId }
      })
      return {
        code: 200,
        message: 'success',
        error: false,
        data: donations
      }
    } catch (err) {
      return {
        error: true,
        code: 500,
        message: err.toString()
      }
    }
  }

  static async donationsOfNGO (ngoId) {
    try {
      const donations = await Donation.findAll({
        attributes: ['donationId', 'ngoId', 'amount'],
        include: [{ model: User, attributes: ['userName'] }],
        where: { ngoId: ngoId }
      })
      return {
        code: 200,
        message: 'success',
        error: false,
        data: donations
      }
    } catch (err) {
      return {
        error: true,
        code: 500,
        message: err.toString()
      }
    }
  }
}

module.exports = NgoController
