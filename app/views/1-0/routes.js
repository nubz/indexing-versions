const router = require('express').Router()
const { version } = require('./_config')
const latestVersion = require('../_latestVersion').latestVersion

router.get('/', (req, res) => {
  req.session.destroy()
  res.render('index', { latestVersion, version })
})

module.exports = router
