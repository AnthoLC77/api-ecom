const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	title: {
		type: String,
		required: [true, 'Veuillez renseigner un titre'],
	},
	description: {
		type: String,
		required: [true, 'Veuillez renseigner une description'],
	},
	price: {
		type: String,
		required: [true, 'Veuillez renseigner un prix'],
	},
	/*
	image: {
		type: String,
	},*/

	createdby: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [null],
	},

	timestamp: {
		type: Date,
		default: Date.now,
	},
});

module.exports = productSchema;
