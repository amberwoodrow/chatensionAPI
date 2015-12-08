var mongoose = require('mongoose'),
    Schema = mongoose.Schema;
  
var roomSchema = Schema({
  url       : String,
  _messages : [{ type: Schema.Types.ObjectId, ref: 'Message' }]
});

module.exports = mongoose.model('Room', roomSchema);