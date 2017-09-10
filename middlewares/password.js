var crypto = require('crypto');

var Password = {
  create: function(text) {
    var secret = 'node-express-crud';
    var pass = crypto.createHmac('sha256', secret)
                    .update(text)
                    .digest('hex');
    return pass;
  },
};

module.exports = Password;
