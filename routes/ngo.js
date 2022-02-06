const router = require('express').Router()
const NgoController = require('../controllers/ngo')
const middlewares = require('../middlewares/auth')

router.post('/login', async (req, res) => {
  const response = await NgoController.login(req.body.idToken)
  res.status(response.code).send(response)
})

router.get('/details', middlewares.isLoggedIn, async (req, res) => {
  const response = await NgoController.getDetails(req.decoded.id)
  res.status(response.code).send(response)
})

router.patch('/update', middlewares.isLoggedIn, async (req, res) => {
  const response = await NgoController.updateDetails(req.decoded.id, req.body.ngoName, req.body.ngoDescription)
  res.status(response.code).send(response)
})

router.post('/post/create', middlewares.isLoggedIn, async (req, res) => {
  const { postTitle, postDescription, postPhotoUrl } = req.body
  const response = await NgoController.createPost(req.decoded.id, postTitle, postDescription, postPhotoUrl)
  res.status(response.code).send(response)
})

module.exports = router
