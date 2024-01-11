const productModel = require('../models/product.model');

// Fonction pour créer un produit (accesible seulement par l'administrateur)
module.exports.createProduct = async (req, res) => {
	try {
		// Vérifier si l'utilisateur est admin
		if (req.user.role !== 'admin') {
			// return d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut créer un produit' });
		}
		// Recuperation des données du formulaire
		const { title, description, price } = req.body;
		// Création d'un produit
		const newProduct = await productModel.create({ title, description, price });

		res.status(200).json({ message: 'Produit ajouté avec success', product: newProduct });
	} catch (error) {
		console.error('Erreur lors de la creation du produit : ', error.message);
		res.status(500).json({ message: 'erreur lors de la création du produit' });
	}
};
