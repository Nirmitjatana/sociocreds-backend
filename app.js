const express = require('express')
const compression = require('compression')
const cors = require('cors')

const morgan = require('./logging/morgan')
const logger = require('./logging/logger')
const routes = require('./routes')
const users = require('./routes/users')
const ngo = require('./routes/ngo')
const shop = require('./routes/shops')
const db = require('./database/connection')

const app = express()

const { migrations } = require('./models/migrations')
migrations()
  .then(() => { logger.info('Migrations made') })
  .catch(err => {
    logger.error(err.toString())
    process.exit(2)
  })

// Database Connection Test
db.authenticate()
  .then(() => {
    logger.info('Connected To Database')
  })
  .catch(err => {
    logger.error('An error occurred' + err)
    process.exit(2)
  })

// Middlewares
app.use(express.json())
app.use(compression())
app.use(cors())

// Logging
app.use(morgan)

// Mount routes
app.use('/', routes)
app.use('/api/v1/user', users)
app.use('/api/v1/ngo', ngo)
app.use('/api/v1/shop', shop)

module.exports = app
