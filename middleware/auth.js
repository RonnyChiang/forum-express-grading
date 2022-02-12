
const helpers = require('../helpers/auth-helpers')
const authenticated = (req, res, next) => {
  // if (req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    return next()
  }
  res.redirect('/signin')
}
const authenticatedAdmin = (req, res, next) => {
  // if (req.isAuthenticated)
  if (helpers.ensureAuthenticated(req)) {
    if (helpers.getUser(req).isAdmin) return next()
    res.redirect('/')
  } else {
    res.redirect('/signin')
  }
}
// 判斷本人權限
const authenticatedSelf = (req, res, next) => {
  if (helpers.ensureAuthenticated(req)) {
    console.log('go')
    if (helpers.getUser(req).id === Number(req.params.id)) return next()
    res.redirect('back')
  } else {
    res.redirect('/signin')
  }
}
module.exports = {
  authenticated,
  authenticatedAdmin,
  authenticatedSelf
}
