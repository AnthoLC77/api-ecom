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

		// Vérification si une image est téléchargée
		if (!req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		// Déclaration de variable pour recuperer le chemin de l'image après le téléchargement
		const imageUrl = req.file.path;

		// Déclaration de variable pour recuperer l'id de l'utilisateur qui va poster un produit
		const userId = req.user._id;

		// Création d'un produit
		const newProduct = await productModel.create({
			title,
			description,
			price,
			imageUrl,
			createdBy: userId,
		});

		res.status(200).json({ message: 'Produit ajouté avec success', product: newProduct });
	} catch (error) {
		console.error('Erreur lors de la creation du produit : ', error.message);
		res.status(500).json({ message: 'erreur lors de la création du produit' });
	}
};

// Fonction pour récuperer tout les produits
module.exports.getAllProducts = async (req, res) => {
	try {
		// Recupération de tous les produits
		const products = await productModel.find();
		// Réponse de success
		res.status(200).json({ message: 'Liste des produits success', products });
	} catch (error) {
		console.erreur('Erreur lors de la récupération des produits : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération des produits' });
	}
};

// Fonction qui va permettre de récuperer un seul produit avec son id
module.exports.getProductsById = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'id du produit
		const productId = req.params.id;

		// Récupération du produit par son id
		const product = await productModel.findById(productId);

		// Condition si le produit est introuvable
		if (!product) {
			return res.status(404).json({ message: 'Produit non trouvé ' });
		}
		res.status(200).json({ message: 'Produit trouvé avec success!', product });
	} catch (error) {
		console.erreur('Erreur lors de la récupération du produit : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la récupération du produit' });
	}
};

// Fonction qui va permettre de delete un produit avec son id (Admin)
module.exports.deleteProduct = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			// return d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut supprimer un produit' });
		}
		// Déclaration de la variable qui va rechercher l'id du produit
		const productId = req.params.id;

		// Récupération du produit par son id
		const deletedProduct = await productModel.findByIdAndDelete(productId);

		if (!deletedProduct) {
			res.status(404).json({ message: 'Produit non trouvé' });
		}

		res.status(200).json({ message: 'Produit supprimé avec success' });
	} catch (error) {
		console.erreur('Erreur lors de la suppression du produit : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la suppression du produit' });
	}
};
