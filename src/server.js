const { createServer } = require('http')
const apiRouter = require('./routes/api')
const webRouter = require('./routes/web')
const express = require('express')
const limitter = require('express-rate-limit')
const path = require('path')
const cors = require('cors')
const logger = require('morgan')
const cookieParser = require('cookie-parser')

const app = express()

var DEBUG
if (process.argv[2] == 'dev') {
  DEBUG = true
} else {
  DEBUG = false
}

app.set('views', path.join('src', 'views'))
app.set('view engine', 'ejs')
app.set('json spaces', 2)

app.use(cors({ origin: '*' }))

if (!DEBUG) {
  app.use(limitter({
    windowMs: 1 * 60 * 1000,
    max: 20,
    message: JSON.stringify({
      message: 'to many request'
    })
  }))
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join('src', 'public')))

app.use('/', webRouter)
app.use('/api/v1', apiRouter)

app.use(function(req, res, next) {
    next(createError(404))
})

app.use(function(err, req, res, next) {
    res.locals.message = err.message
    res.locals.error = req.app.get('env') === 'development' ? err : {}

    res.status(err.status || 500)
    res.render('error')
})

const server = createServer(app)

module.exports = server