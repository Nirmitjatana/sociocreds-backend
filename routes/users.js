const router = require('express').Router()
const UserController = require('../controllers/users')
const DonationController = require('../controllers/donation')
const middlewares = require('../middlewares/auth')

router.post('/login', async (req, res) => {
  const response = await UserController.login(req.body.idToken)
  res.status(response.code).send(response)
})

router.get('/details', middlewares.isLoggedIn, async (req, res) => {
  const response = await UserController.getDetails(req.decoded.id)
  res.status(response.code).send(response)
})

router.post('/donate', middlewares.isLoggedIn, async (req, res) => {
  const { campaignId, amount, description } = req.body
  const response = await DonationController.donateRandomNGO(req.decoded.id, campaignId, amount, description)
  res.status(response.code).send(response)
})

router.get('/transactions', middlewares.isLoggedIn, async (req, res) => {
  const response = await UserController.getTransactions(req.decoded.id)
  res.status(response.code).send(response)
})

router.get('/transactions/recent', middlewares.isLoggedIn, async (req, res) => {
  const response = await UserController.GetRecent(req.decoded.id)
  res.status(response.code).send(response)
})

router.get('/campaigns/fetch', async (req, res) => {
  const response = await UserController.GetCampaigns()
  res.status(response.code).send(response)
})

router.get('/posts/fetch', async (req, res) => {
  const response = await UserController.GetPosts()
  res.status(response.code).send(response)
})

router.get('/leaderboard', async (req, res) => {
  const response = await UserController.LeaderBoard()
  res.status(response.code).send(response)
})

module.exports = router
