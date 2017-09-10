var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var anggotaSchema = new Schema({
  username: String,
  email: String,
  password: String,
  nama: {
    depan: String,
    belakang: String,
  },
  ttl: {
    t: String,
    tl: Date,
  },
  gender: String,
  alamat: String,
  foto_profil: String,
});

var Anggota = mongoose.model('Anggota', anggotaSchema);
module.exports = Anggota;
