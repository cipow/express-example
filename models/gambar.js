var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gambarSchema = new Schema({
  judul: String,
  upload_by: String,
  keterangan: String,
  resolution: String,
  size: String,
}, {
  timestamps: true,
});

var Gambar = mongoose.model('Gambar', gambarSchema);
module.exports = Gambar;
