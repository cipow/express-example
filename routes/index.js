var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/auth');
var anggota = require('../models/anggota');
var Pass = require('../middlewares/password');
var moment = require('moment');
var fs = require('fs');
var formidable = require('formidable');

router.get('/', Auth.is_login, Auth.is_anggota, function(req, res, next) {
  anggota.find({username: req.session.name}, function(err, result) {
    res.render('index', {
      Data: result[0],
      moment: moment,
    });
  }).select('username email nama.depan nama.belakang ttl.t ttl.tl gender alamat foto_profil');
});

router.post('/upload', Auth.is_login, Auth.is_anggota, function(req, res, next) {
  var form = new formidable.IncomingForm();
  form.parse(req, function(err, fields, files) {
    if(!err) {
      var tmp_path = files.profil.path;
      var upload_path = './public/images/profil/'+req.session.name+'-'+files.profil.name;

      fs.rename(tmp_path, upload_path, function(err) {
        if(!err) {
          anggota.find({username: req.session.name}, function(err, result) {
            var old_picture = result[0].foto_profil;
            result[0].foto_profil = '/images/profil/'+req.session.name+'-'+files.profil.name;
            result[0].save();

            if(!((old_picture=='/images/default/pria.png')||(old_picture=='/images/default/wanita.png'))){
              fs.unlink('./public'+old_picture, function(err) {});
            }
          });
          res.redirect('/');
        } else {
          console.log(err);
          anggota.find({username: req.session.name}, function(err, result) {
            res.render('index', {
              Data: result[0],
              moment: moment,
              msg_err: 'Ada Kesalahan pada sistem',
            });
          }).select('username email nama.depan nama.belakang ttl.t ttl.tl gender alamat foto_profil');
        }
      });
    } else {
      console.log(err);
      anggota.find({username: req.session.name}, function(err, result) {
        res.render('index', {
          Data: result[0],
          moment: moment,
          msg_err: 'Ada Kesalahan pada sistem',
        });
      }).select('username email nama.depan nama.belakang ttl.t ttl.tl gender alamat foto_profil');
    }
  });
});

router.route('/edit/profil')
  .get(Auth.is_login, Auth.is_anggota, function(req, res, next) {
    anggota.find({username: req.session.name}, function(err, result) {
      res.render('edit', {
        Data: result[0],
        moment: moment,
      });
    }).select('username email nama.depan nama.belakang ttl.t ttl.tl gender alamat');
  })
  .put(Auth.is_login, Auth.is_anggota, function(req, res, next) {
    anggota.find({username:req.session.name}, function(err, result) {
      result[0].username = req.body.username;
      result[0].email = req.body.email;
      result[0].nama.depan = req.body.nama_depan;
      result[0].nama.belakang = req.body.nama_belakang;
      result[0].ttl.t = req.body.t;
      result[0].ttl.tl = req.body.tl;
      result[0].gender = req.body.gender;
      result[0].alamat = req.body.alamat;
      result[0].save(function(err) {
        if(!err) {
          res.redirect('/');
        }
      });

    }).select('username email nama.depan nama.belakang ttl.t ttl.tl gender alamat');
  });

router.route('/edit/password')
  .get(Auth.is_login, Auth.is_anggota, function(req, res, next) {
    res.render('passwords');
  })
  .put(Auth.is_login, Auth.is_anggota, function(req, res, next) {
    anggota.find({username:req.session.name,password:Pass.create(req.body.old)}, function(err, result) {
      result[0].password = Pass.create(req.body.new);
      result[0].save(function(err) {
        if(!err){
          res.redirect('/');
        }
      });
    }).select('password');
  });

router.route('/register')
  .get(function(req, res, next) {
    res.render('register', {
      msg_err: req.flash('msg_err'),
    });
  })
  .post(function(req, res, next) {

    // Validasi form
    req.check('username', 'Username Diperlukan, min 6 max 32 karakter')
      .isLength({min: 6, max: 32})
      .isAlphanumeric()
      .withMessage('Username hanya boleh berisi huruf dan angka');
    req.check('email', 'Email Diperlukan')
      .notEmpty()
      .isEmail()
      .withMessage('Email tidak valid');
    req.check('password', 'Password harus mengandung minimal satu angka, huruf kecil, dan huruf besar. Spesial karakter dilarang')
      .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])([0-9a-zA-Z]+)$/, "i") // Regex expression
      .isLength({min: 8, max: 32})
      .withMessage('Password minimal 8 dan maksimal 32 karakter');
    req.check('nama_depan', 'Nama Depan tidak boleh kosong')
      .notEmpty();
    req.check('t', 'Dimana anda lahir ?')
      .notEmpty();
    req.check('tl', 'Kapan anda lahir ?')
      .notEmpty();
    req.check('gender', 'Pria / Wanita')
      .isIn(['Pria', 'Wanita']);

    var renderBack = {
      msg_err: '',
      username: req.body.username,
      email: req.body.email,
      nama_depan: req.body.nama_depan,
      nama_belakang: req.body.nama_belakang,
      t: req.body.t,
      tl: req.body.tl,
      alamat: req.body.alamat,
    };

    req.getValidationResult().then(function(result) {
      if(!result.isEmpty()) {
        var detail_error = '<ul>';
        for(var i=0; i<result.array().length; i++) {
          detail_error += '<li>' + result.array()[i].msg + '</li>';
        }
        detail_error += '</ul>';
        renderBack.msg_err = detail_error;
        res.render('register', renderBack);
      } else {
        // mengescape html dan dan menghilangkan white space
        var v_nama_depan = req.sanitize('nama_depan').escape().trim();
        var v_nama_belakang = req.sanitize('nama_belakang').escape().trim();
        var v_t = req.sanitize('t').escape().trim();
        var v_alamat = req.sanitize('alamat').escape().trim();

        anggota.find({username: req.body.username}, function(err, result) {
          // jika ada username sama
          if(result.length > 0) {
            renderBack.msg_err = '<ul><li>Username telah digunakan</li></ul>';
            res.render('register', renderBack);
          } else {
            var fp;
            if(req.body.gender == 'Pria') {
              fp = '/images/default/pria.png';
            } else {
              fp = '/images/default/wanita.png';
            }
            var newAnggota = new anggota({
              username: req.body.username,
              email: req.body.email,
              password: Pass.create(req.body.password),
              nama: {
                depan: v_nama_depan,
                belakang: v_nama_belakang,
              },
              ttl: {
                t: v_t,
                tl: req.body.tl,
              },
              gender: req.body.gender,
              alamat: v_alamat,
              foto_profil: fp,
            });

            newAnggota.save(function(err) {
              if(err) {
                renderBack.msg_err = 'Ada kesalahan pada sistem, silahkan mencoba lagi';
                res.render('register', renderBack);
              } else {
                res.redirect('/login');
              }
            });
          }
        });
      }
    });
  });

router.route('/login')
  .get(function(req, res, next) {
    if(req.session.login) {
      res.redirect('/');
    }
    res.render('login', {message: req.flash('msg_err')});
  })
  .post(function(req, res, next) {
    anggota.find({
      $and: [
        { $or: [{username: req.body.user},{email: req.body.user}] },
        { password: Pass.create(req.body.password) },
      ],
    }, function(err, result) {
      if(result.length > 0) {
        // inisialisasi session
        req.session.name = result[0].username;
        req.session.login = true;
        req.session.admin = false;

        res.redirect('/');
      } else {
        req.flash('msg_err', 'Maaf username/email dan password tidak cocok');
        res.redirect('/login');
      }
    });
  });

router.get('/keluar', Auth.is_login, Auth.is_anggota, function(req, res, next) {
  req.session.destroy(function(err){
    if(err) {
      console.log(err);
    } else {
      res.redirect('/login');
    }
  });
});

module.exports = router;
