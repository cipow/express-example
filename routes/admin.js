var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/auth');
var pass = require('../middlewares/password');
var admin = require('../models/admin');

router.get('/', Auth.is_login, Auth.is_admin, function(req, res, next) {
  res.render('admin/index', {
    name: req.session.name
  });
});

router.route('/login')
  .get(function(req, res, next) {
    // jika sudah login
    if(req.session.login && req.session.admin) {
      res.redirect('/admin');
    }

    admin.find({}, function(err, admins) {
      // cek jika jumlah admin tidak 0
      if(admins.length > 0) {
        res.render('admin/login', {message: req.flash('msg_err')});
      } else {
        // jika admin kosong maka akan dibuatkan defaulnya
        var newAdmin = new admin({
          username: 'admin',
          password: pass.create('admin1234'),
        });

        newAdmin.save(function(err) {
          if(!err) {
            res.redirect('/admin/login');
          }
        });
      }
    });
  })
  .post(function(req, res, next) {
    admin.find({
      username: req.body.username,
      password: pass.create(req.body.password),
    }, function(err, admins) {
      if(admins.length > 0) {
        req.session.name = req.body.username;
        req.session.login = true;
        req.session.admin = true;

        res.redirect('/admin');
      } else {
        req.flash('msg_err', 'Maaf username dan password tidak cocok');
        res.redirect('/admin/login');
      }
    });
  });

router.get('/keluar', Auth.is_login, Auth.is_admin, function(req, res, next) {
  req.session.destroy(function(err){
    if(err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

module.exports = router;
