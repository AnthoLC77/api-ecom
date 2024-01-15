const mongoose = require('mongoose');

const userSchema = new moongose.Schema({
	lastname: {
		type: String,
		required: true,
	},

	firstname: {
		type: String,
		required: true,
	},

	birthday: {
		type: String,
		required: true,
	},

	adress: {
		type: String,
		required: true,
	},

	zipcode: {
		type: String,
		required: true,
	},

	city: {
		type: String,
		required: true,
	},

	phone: {
		type: number,
		required: true,
	},

	imagePublicId: {
		type: String,
		Default: null,
	},

	avatar: {
		type: String,
		required: true,
	},

	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const User = mongoose.model('User', userSchema);

module.exports = User;
