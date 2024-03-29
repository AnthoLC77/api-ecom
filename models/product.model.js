const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Auth',
	},

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

	imageUrl: {
		type: String,
	},

	imagePublicId: {
		type: String,
		Default: null,
	},

	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model('Produit', productSchema);

module.exports = Product;
