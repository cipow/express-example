var express = require('express');
var router = express.Router();
var Auth = require('../middlewares/auth');
var anggota = require('../models/anggota');
var fs = require('fs');
var formidable = require('formidable');

router.get('/', Auth.is_login, Auth.is_anggota, function(req, res, next) {
  res.render('gambar/index');
});

module.exports = router;
