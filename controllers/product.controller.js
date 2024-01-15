const productModel = require('../models/product.model');
const cloudinary = require('cloudinary').v2;

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
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		// Déclaration de variable pour recuperer l'id de l'utilisateur qui va poster un produit
		const userId = req.user._id;

		// Utilisation de l'url de cloudinary et du public_id provenant du middleware
		const imageUrl = req.cloudinaryUrl;
		const imagePublicId = req.file.public_id;

		// Création d'un produit
		const newProduct = await productModel.create({
			title,
			description,
			price,
			imageUrl,
			imagePublicId,
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

// Fonction qui va permettre de d'updte un produit avec son id (Admin)
module.exports.updateProduct = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			// return d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut modifier un produit' });
		}

		// Déclaration de la variable qui va rechercher l'id du produit en paramètre de l'url
		const productId = req.params.id;

		// Déclaration de la variable pour
		const existingProduct = await productModel.findById(productId);

		if (!existingProduct) {
			return res.status(400).json({ message: 'Produit non trouvé' });
		}

		// Modifie les données entrées dans le formulaire
		existingProduct.title = req.body.title || existingProduct.title;
		existingProduct.description = req.body.description || existingProduct.description;
		existingProduct.price = req.body.price || existingProduct.price;

		// Vérifier si une nouvelle image est téléchargée, mettre à jour le chemin de l'image
		if (req.file) {
			// Supprimer l'ancienne image si il y'en a une
			if (existingProduct.image) {
				fs.unlinkSync(existingProduct.image);
			}
			// Recupere le chemin de la nouvelle image
			existingProduct.imageUrl = req.file.path;
		}
		// Enregistrer les modifications dans la BDD
		const updateProducts = await existingProduct.save();

		// Réponse de succes
		res.status(200).json({
			message: 'Modification du produit effectué avec success !',
			product: updateProducts,
		});
	} catch (error) {
		console.log('Erreur lors de la modification du produit : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la modification du produit' });
	}
};
