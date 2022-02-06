const router = require('express').Router()
const ShopController = require('../controllers/shops')

router.post('/create', async (req, res) => {
  const response = await ShopController.createShop(req.body.shopName, req.body.shopAddress)
  res.status(response.code).send(response)
})

router.get('/details', async (req, res) => {
  const response = await ShopController.getShopDetails(req.body.shopId)
  res.status(response.code).send(response)
})

router.post('/points/send', async (req, res) => {
  const response = await ShopController.sendPoints(req.body.shopId, req.body.userId, req.body.amount)
  res.status(response.code).send(response)
})

module.exports = router
