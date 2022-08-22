const insertLine = require('insert-line')
const glob = require('glob')
const fs = require('fs')
const path = require('path')
const utils = require('../lib/utils.js')
const validation = require('@nubz/gds-validation')
const { latestVersion } = require('./views/_latestVersion')
const DOTCHAR = '-'

const findVersionsOfPage = (req, res) => {

  let configs = []
  const allVersions = []
  glob('app/views/**/_config.js', function (err, versions) {
    if (err) {
      console.log(err)
    }
    versions.forEach(v => {
      const thisVersion = v.split('/')[2]
      allVersions.push({ url: thisVersion + '/' + req.params[0], version: thisVersion })
    })
  })

  glob('app/views/**/' + req.params[0] + '.html', function (err, files) {
    if (err) {
      console.log(err)
    }

    if (files.length < 1) {
      // push version defaults as routes instead of files
      configs = allVersions
    }

    files.forEach(file => {
      console.log(file)
      const url = file.replace('app/views/', '')
      const version = url.split('/')[0]
      configs.push({ url, version })
    })

    res.render('_versions.html', {
      urls: configs.sort((a, b) =>
        parseFloat(b.version.replace(DOTCHAR, '.')) - parseFloat(a.version.replace(DOTCHAR, '.'))
      ),
      page: req.params[0]
    })
  })
}

const newVersionGet = (req, res) => {
  // the route should not work anywhere other than localhost
  if (!req.headers.host.startsWith('localhost')) {
    res.sendStatus(400)
  } else {
    res.render('_new-version', { latestVersion })
  }
}

const newVersionPost = (req, res) => {
  // the route should not work anywhere other than localhost
  if (!req.headers.host.startsWith('localhost')) {
    res.sendStatus(400)
  } else {
    const errors = validation.getPageErrors(req.body, {
      fields: {
        'old-version': {
          type: 'nonEmptyString',
          name: 'the name of the version to copy',
          regex: /^([a-zA-Z0-9_-]+)$/,
          patternText: 'The name of the version to copy must only contain letters, numbers, hyphens or underscores, for example v13_1'
        },
        'new-version': {
          type: 'nonEmptyString',
          name: 'the name of the new version',
          regex: /^([a-zA-Z0-9_-]+)$/,
          patternText: 'The name of the new version must only contain letters, numbers, hyphens or underscores, for example v13_1'
        }
      }
    })

    if (errors.summary.length > 0) {
      res.render('_new-version', { errors, latestVersion })
    } else {
      _createNewVersion(req, res)
    }
  }
}

const copyFolderSync = (from, to) => {
  fs.mkdirSync(to)
  fs.readdirSync(from).forEach(f => {
    if (fs.lstatSync(path.join(from, f)).isFile()) {
      fs.copyFileSync(path.join(from, f), path.join(to, f))
    } else {
      copyFolderSync(path.join(from, f), path.join(to, f))
    }
  })
}

const _countLines = (filePath, callback) => {
  let i
  let count = 0
  fs.createReadStream(filePath)
    .on('error', e => callback(e))
    .on('data', chunk => {
      for (i = 0; i < chunk.length; ++i) if (chunk[i] === 10) count++
    })
    .on('end', () => callback(null, count))
}

const _createNewVersion = (req, res) => {
  const env = utils.getNodeEnv()
  if (env !== 'development') {
    res.redirect('_wrong-host')
  } else {
    const oldVersion = req.body['old-version']
    const newVersion = req.body['new-version']
    const oldVersionPath = path.join('app', 'views', `${oldVersion}`)
    const newVersionPath = path.join('app', 'views', `${newVersion}`)
    const newVersionIndexTabs = path.join(oldVersionPath, '_index-tabs')

    // check version is correct and available to copy
    if (fs.existsSync(oldVersionPath)) {
      copyFolderSync(oldVersionPath, newVersionPath)
      // update latestVersion
      const latestVersionFile = path.join('app', 'views', '_latestVersion.js')
      const lv = require('../' + latestVersionFile)
      lv.latestVersion = newVersion
      fs.writeFileSync(latestVersionFile, 'module.exports = ' + JSON.stringify(lv, null, 2))

      // update config
      const configFile = path.join(newVersionPath, '_config.js')
      const newConfig = require('../' + configFile)
      newConfig.version = newVersion
      fs.writeFileSync(configFile, 'module.exports = ' + JSON.stringify(newConfig, null, 2))
      // update changelog
      const changeLogFile = path.join(newVersionIndexTabs, '_changelog.html')
      fs.writeFileSync(changeLogFile, `<ul class="govuk-list govuk-list--bullet"><li>Cloned from ${oldVersion}</li></ul>`)
      // clear out page status badges
      const pagesFile = path.join(newVersionIndexTabs, '_pages.html')
      const pagesContent = fs.readFileSync(pagesFile, 'utf-8')
      const cleanedPagesContent = pagesContent
        .replace(/changed-page/g, '')
        .replace(/new-page/g, '')
      fs.writeFileSync(pagesFile, cleanedPagesContent)
      // add a link to the new version into the index side bar
      const indexFile = path.join('app', 'views', 'index.html')
      const indexContent = fs.readFileSync(indexFile, 'utf-8')
      const indexLinkAdded = indexContent
        .replace(/<ul id="version-menu" class="govuk-list">/, `<ul id="version-menu" class="govuk-list"><li><a href="/${newVersion}" class="govuk-link">${newVersion}</a></li>`)
      fs.writeFileSync(indexFile, indexLinkAdded)
      // update main routes file to use new version routes
      fs.copyFileSync(path.join('app', 'routes.js'), path.join('app', 'routes-copy.js'))
      _countLines(path.join('app', 'routes-copy.js'), (err, count) => {
        if (err) {
          console.error(err)
        } else {
          const newRoutesHook = `router.use('/${newVersion}', require('./views/${newVersion}/routes'))`
          insertLine(path.join('app', 'routes-copy.js')).content(newRoutesHook).at(count).then((err) => {
            if (err) {
              console.error(err)
            }
            fs.copyFileSync(path.join('app', 'routes-copy.js'), path.join('app', 'routes.js'))
            fs.unlink(path.join('app', 'routes-copy.js'), err => console.error(err))
            res.redirect('/')
          })
        }
      })
    } else {
      const field = 'old-version'
      const error = 'The old version you have specified does not exist and cannot be cloned'
      const formError = {
        id: field,
        href: '#' + field,
        text: error
      }
      const errors = { summary: [formError], inline: { [field]: formError }, text: { [field]: error } }
      res.render('_new-version', { errors })
    }
  }
}

module.exports = {
  DOTCHAR,
  findVersionsOfPage,
  newVersionPost,
  newVersionGet
}
