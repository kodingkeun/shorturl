var createError = require('http-errors')
var express = require('express')
var path = require('path')
var cookieParser = require('cookie-parser')
var logger = require('morgan')
var cors = require('cors')
var limitter = require('express-rate-limit')

var webRouter = require('./routes/web')
var apiRouter = require('./routes/api')

var app = express()
var PORT = process.env.PORT || 8000
var server = app.listen(PORT)

var limitRequest = limitter({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: JSON.stringify({
    message: 'to many request'
  })
})


var DEBUG
if (process.argv[2] == 'dev') {
  DEBUG = true
} else {
  DEBUG = false
}

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')
app.set('json spaces', 2)

app.use(cors({ origin: '*' }))

if (!DEBUG) {
  app.use(limitRequest)
}

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

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

module.exports = app
