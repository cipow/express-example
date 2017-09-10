var Auth = {
  is_login: function(req, res, next) {
    if(!req.session.login) {
      return res.redirect('/login');
    }
    next();
  },
  is_admin: function(req, res, next) {
    if(!req.session.admin) {
      return res.redirect('/');
    }
    next();
  },
  is_anggota: function(req, res, next) {
    if(req.session.admin) {
      return res.redirect('/admin');
    }
    next();
  },
};

module.exports = Auth;
