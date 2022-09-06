const express = require('express')
require('express-async-errors')
const app = express()

const cors = require('cors')
const config = require('./utils/config')
const logger = require('./utils/logger')
const blogsRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const mongoose = require('mongoose')
const middleware = require('./utils/middleware')
var _ = require('lodash')



mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to mongoDB')
  }).catch((error) => {
    logger.error('error connecting to mongo', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(cors())
app.use(express.json())
app.use(middleware.requestLogger)
app.use(middleware.tokenExtractor)

app.use('/api/blogs', blogsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.get('/health', (req, res) => {
  res.send('ok')
})

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing')
  app.use('/api/testing', testingRouter)
}
//12345544s42

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app