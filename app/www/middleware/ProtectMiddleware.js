async function ProtectMiddleware(req, res, next) {
    next()
}

module.exports = ProtectMiddleware 