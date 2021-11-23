const redirectUser = (req, res, next) => {
    if (!req.session.userLogin) {
        res.redirect('/login');
    }
    else {
        next();
    }
}

const givePermission = (req, res, next) => {
    if (req.session.userLogin) {
        res.redirect('/home');
    }
    else {
        next();
    }
}

module.exports = { redirectUser, givePermission };