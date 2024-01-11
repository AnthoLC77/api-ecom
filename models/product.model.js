const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
	createdby: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [null],
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
	timestamp: {
		type: Date,
		default: Date.now,
	},
});

const Product = mongoose.model('Produit', productSchema);

module.exports = Product;
