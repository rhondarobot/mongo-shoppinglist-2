var mongoose = require('mongoose');

var ItemSchema = new mongoose.Schema({
	//throw error if item saved without a name
	name: { type: String, required: true }
});

var Item = mongoose.model('Item', ItemSchema);

module.exports = Item;
//do not need to connect to database in this file
