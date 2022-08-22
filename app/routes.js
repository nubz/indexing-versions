const express = require('express')
const router = express.Router()
const latestVersion = require('./views/_latestVersion').latestVersion
const { findVersionsOfPage, newVersionPost, newVersionGet } = require('./utilities')

router.get('/', function (req, res) {
  req.session.destroy()
  res.render('index', { latestVersion, version: latestVersion })
})

router.get('/versions/*', findVersionsOfPage)
router.get('/new-version', newVersionGet)
router.post('/new-version', newVersionPost)

router.use('/1-0', require('./views/1-0/routes'))
module.exports = router
