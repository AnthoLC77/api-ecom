// Import du mode utilisateur
const authModel = require('../models/auth.model');
// Import de la validation des données
const { validationResult } = require('express-validator');
// Import du modèle de hachage bcrypt
const bcrypt = require('bcryptjs');
// Import du module jwt pour les tokens
const jwt = require('jsonwebtoken');
// Import du module cloudinary
const cloudinary = require('cloudinary').v2;

// Fonction pour l'inscription
module.exports.register = async (req, res) => {
	// Validation des données d'entrée
	try {
		// Recupération des erreurs de validations
		const errors = validationResult(req);
		// Vérification si il y a des erreurs de validation
		if (!errors.isEmpty()) {
			// Renvoi des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}
		// Récupération des données du formulaire
		const { lastname, firstname, birthday, address, zipcode, city, phone, email, password } =
			req.body;

		// Vérifier si une image est téléchargée
		if (!req.cloudinaryUrl || !req.file) {
			return res.status(400).json({ message: 'Veuillez télécharger une image' });
		}

		// Vérification de l'email si il existe deja dans la base de données
		const existingAuth = await authModel.findOne({ email });
		// Renvoie une erreur si l'email existe deja
		if (existingAuth) {
			return res.status(400).json({
				message: 'Votre email existe deja en base de données. Veuillez en choisir un autre',
			});
		}

		// Utilisation de l'url cloudinary et du public_id provenant du middleware
		const avatarUrl = req.cloudinaryUrl;
		const avatarPublicId = req.file.public_id;

		// Création d'un nouvel utilisateur
		const auth = await authModel.create({
			lastname,
			firstname,
			birthday,
			address,
			zipcode,
			city,
			phone,
			email,
			password,
			avatarUrl,
			avatarPublicId,
		});

		// Renvoie une reponse positive si l'utilisateur est bien enregistré
		res.status(201).json({ message: 'Utilisateur crée avec succès', auth });
	} catch (err) {
		// Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
		console.error(err);
		res.status(500).json({
			message: "Erreur lors de l'enregistrement de l'utilisateur",
		});
	}
};

// Fonction pour la connexion
module.exports.login = async (req, res) => {
	try {
		// Récupération des erreurs de validations
		const errors = validationResult(req);
		// Vérification si il y a des erreurs de validation
		if (!errors.isEmpty) {
			// Renvoie des erreurs de validation
			return res.status(400).json({ errors: errors.array() });
		}
		// Récuperation des données du formulaire
		const { email, password } = req.body;
		// Vérification si l'utilisateur existe deja dans la base de données
		const user = await authModel.findOne({ email });
		// Si l'utilisateur n'existe pas, renvoie une erreur
		if (!user) {
			console.log('Utilisateur non trouvé');
			return res.status(400).json({ message: 'Inconnu au bataillon' });
		}
		// Vérification du mot de passe
		// password = mot de passe qu'on rentre dans le login & user.password = le mot de passe en bdd
		const isPasswordValid = await bcrypt.compare(password, user.password);
		// Si le mot de passe est incorrect, renvoie une erreur
		if (!isPasswordValid) {
			console.log('Mot de passe incorrect');
			return res.status(400).json({ message: 'Mot de passe incorrect' });
		}
		// Renvoie d'un message de success
		console.log('Connexion success !');

		// Création du token jwt
		const payload = {
			user: {
				id: user._id,
				email: user.email,
			},
		};
		// Définition de la variable pour le token
		const secreteKey = process.env.JWT_SECRET;
		// Définition de la date d'expiration du token
		const token = jwt.sign(payload, secreteKey, { expiresIn: '1h' });
		// Renvoie un message de réussite et le token
		res.status(200).json({ message: 'Connexion réussie', token });
	} catch (error) {
		// Renvoie une erreur si il y a un problème lors de la connexion de l'utilisateur
		console.error('Erreur lors de la connexion : ', error.message);
		res.status(500).json({ message: 'Erreur lors de la connexion' });
	}
};
