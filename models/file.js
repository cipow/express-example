var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var fileSchema = new Schema({
  nama: String,
  upload_by: String,
  keterangan: String,
  size: String,
}, {
  timestamps: true,
});

var Files = mongoose.model('Files', fileSchema);
module.exports = Files;
