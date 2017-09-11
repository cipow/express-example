var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/auth');
var gambar = require('../models/gambar');
var fs = require('fs');
var formidable = require('formidable');

router.get('/', Auth.is_login, Auth.is_anggota, function(req, res, next) {
  res.render('gambar/index');
});

router.route('/upload')
  .get(Auth.is_login, Auth.is_anggota, function(req, res, next) {
    res.render('gambar/add');
  })
  .post(Auth.is_login, Auth.is_anggota, function(req, res, next) {
    var form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files) {
      var judul, keterangan;

      judul = fields.judul != '' ? fields.judul : 'Tidak ada judul';
      keterangan = fields.keterangan != '' ? fields.keterangan : 'Tidak ada keterangan';

      if(!err) {
        var tmp_path = files.profil.path;
        var upload_path = './public/images/'+req.session.name+'-'+files.profil.name;

        fs.rename(tmp_path, upload_path, function(err) {
          if(!err) {
            var newGambar = new gambar({
              nama: '/images/'+req.session.name+'-'+files.profil.name,
              judul: judul,
              upload_by: req.session.name,
              keterangan: keterangan,
              size: files.profil.size,
            });
            newGambar.save();

            res.redirect('/gambar');
          }
        });
      }
    });
  });

module.exports = router;
