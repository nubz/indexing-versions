window.GOVUKFrontend && window.GOVUKFrontend.initAll()

// Warn about using the kit in production
if (window.console && window.console.info) {
  window.console.info('GOV.UK Prototype Kit - do not use for production')
}

// helper for prototype only - allows versions to be browsed on same tab
function maintainHash (e) {
  e.preventDefault()
  document.location = this.href + (window.location.hash.length > 0 ? window.location.hash : '#changelog')
}

document.querySelectorAll('a.maintain-hash')
  .forEach(function(el) {
    el.addEventListener('click', maintainHash)
  })

// this will enable version comparisons by using the current
// location (which is why it's client side) to pass the
// page name to the router and also we remove the link
// if we are already in an iframe (to avoid infinite nesting)
document.querySelectorAll('a[href="/versions/"]')
  .forEach(function (el) {
    if (window.location !== window.parent.location) {
      el.remove()
    } else {
      el.addEventListener('click', function (e) {
        e.preventDefault()
        document.location = '/versions/' + window.location.pathname.split('/').splice(2).join('/')
      })
    }
  })

// this will ensure cloud (e.g. heroku) users will not see this link as it
// can control file system operations that should only be done
// on localhost before committing to git
document.querySelectorAll('a[href="/new-version"]')
  .forEach(function (el) {
    if (window.location.hostname !== 'localhost') {
      el.remove()
    }
  })