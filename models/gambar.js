var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gambarSchema = new Schema({
  nama: String,
  judul: String,
  upload_by: String,
  keterangan: String,
  size: String,
}, {
  timestamps: true,
});

var Gambar = mongoose.model('Gambar', gambarSchema);
module.exports = Gambar;
