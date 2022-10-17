var express = require('express')
var fs = require('fs')
var crypto = require('crypto')
var router = express.Router()
var path = require('path')

var { cwd }  = process

var pathDB = path.join(cwd(), 'src', 'database', 'database.json')
var pathContributors = path.join(cwd(), 'src', 'database', 'contributors.json')

var db = fs.readFileSync(pathDB, 'utf-8') || '[]'
var contributors = fs.readFileSync(pathContributors, 'utf-8') || '[]'
db = JSON.parse(db)
contributors = JSON.parse(contributors)

router.get('/', function(req, res, next) {
    res.status(200).json({
        message: 'Hello world!'
    })
})

router.get('/contributors', function(req, res, next) {
    res.status(200).json({
        contributors
    })
})

router.post('/url', function(req, res, next) {
    var { url, custom_key } = req.body
    var key = crypto.randomBytes(4).toString('hex')
    if (custom_key) key = custom_key
    if (/\d/g.test(key[0])) key = randomAlphabet()+key
    if (!custom_key) custom_key = null
    if (!url) {
        res.status(400).json({
            status: false,
            message: 'url is required'
        })
    }
    if (url) url = !(url.startsWith('http://') || url.startsWith('https://')) ? 'http://' + url : url

    var regex = /^[\d]|\W/g
    var validate_url = validateUrl({ url: url })
    var validateKey = regex.test(key)

    if (validate_url) {
        var redirect_uri = url
        var result = {
            key,
            redirect_uri,
        }

        var collectKey = db.map(({ key }) => key)
        if (collectKey.includes(key)) {
            res.status(400).json({
                status: false,
                message: 'key already exists'
            })
        } else if (validateKey) {
            res.status(400).json({
                status: false,
                message: `missing key`
            })
        } else {
            saveToDB(result).then(({ data }) => {
                res.status(200).json({
                    status: true,
                    data
                })
            })
        }
    } else {
        res.status(400).json({
            status: false,
            message: 'missing url'
        })
    }
})

function saveToDB({ key, redirect_uri } = {}) {
    var data = { key, redirect_uri, count: 0 }
    db.push(data)
    fs.writeFileSync(pathDB, JSON.stringify(db))
    return new Promise(resolve => {
        resolve({
            data
        })
    })
}

function validateUrl({ url } = {}) {
    var regex = /((?:(?:http?|ftp)[s]*:\/\/)?[a-z0-9-%\/\&=?\.]+\.[a-z]{2,4}\/?([^\s<>\#%"\,\{\}\\|\\\^\[\]`]+)?)/i
    return regex.test(url)
}

function randomAlphabet() {
    var alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')
    var random = alphabet[Math.floor(Math.random() * alphabet.length)]
    return random
}

module.exports = router
