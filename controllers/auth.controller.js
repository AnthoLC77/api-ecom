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
// Import du nodemailer pour l'envoie de mail de verif
const nodemailer = require('nodemailer');
// Import de crypto pour la génération du token
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
	host: 'sandbox.smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: process.env.MAILTRAP_USER,
		pass: process.env.MAILTRAP_PASS,
	},
});

// Déclaration de variable pour générer un token avec crypto
const generateVerificationToken = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Déclaration de variable pour générer un token password avec crypto
const generateVerificationTokenPassword = () => {
	return crypto.randomBytes(32).toString('hex');
};

// Fonction de vérification pour la réinitialisation du mot de passe
const sendResetPassword = async (to, resetPasswordToken) => {
	// Variable qui va contenir le lien de vérification
	const resetPasswordLink = `http://localhost:5000/forgot-password?token=${resetPasswordToken}`;
	const mailOptions = {
		from: 'forgot-password@gmail.com',
		to,
		subject: 'Réinitialisation du mot de passe',
		text: `Réinitialisation dde votre mot de passe en cliquant sur ce <a href=${resetPasswordLink}>Lien</a>`,
		html: `<p> Merci de cliquer sur le lien pour réinitialisation votre du mot de passe  </p>`,
	};

	await transporter.sendMail(mailOptions);
};

// Fonction de la vérification de l'envoi email
const sendVerificationEmail = async (to, verificationToken) => {
	// Variable qui va contenir le lien de vérification
	const verificationLink = `http://localhost:5000/verify?token=${verificationToken}`;

	const mailOptions = {
		from: 'verificationEmail@gmail.com',
		to,
		subject: 'Mail de validation de compte',
		text: `Merci de vérifier votre email en cliquant sur ce <a href=${verificationLink}>Lien</a>`,
		html: `<p> Merci de cliquer sur le lien pour verifier votre adresse mail et pouvoir vous connecter  </p>`,
	};

	await transporter.sendMail(mailOptions);
};

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
			if (req.file && req.file.public_id) {
				await cloudinary.uploader.destroy(req.file.public_id);
			}
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

		// Generation de la vérification de token sécurisé
		const verificationToken = generateVerificationToken();

		// Sauvegarder le token gérérer dans la BDD et l'associé à l'utilisateur
		auth.emailVerificationToken = verificationToken;
		auth.emailVerificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

		auth.isEmailVerified = false;
		// Sauvegarder
		await auth.save();

		// Envoyer la vérification d'email
		await sendVerificationEmail(auth.email, verificationToken);

		// Renvoie une reponse positive si l'utilisateur est bien enregistré
		res.status(201).json({
			message: `Utilisateur crée avec succès, verifier votre email pour valider votre compte : `,
			auth,
		});
	} catch (err) {
		// Renvoie une erreur si il y a un probleme lors de l'enregistrement de l'utilisateur
		console.error(err);
		// Supprimer l'image télécharger si elle existe
		if (req.file && req.file.public_id) {
			await cloudinary.uploader.destroy(req.file.public_id);
		}
		res.status(500).json({
			message: "Erreur lors de l'enregistrement de l'utilisateur",
		});
	}
};

// Fonction pour la vérification email
module.exports.verifyEmail = async (req, res) => {
	try {
		// Récupération du token pour le mettre en paramètre d'url
		const { token } = req.params;

		// Trouver l'utilisateur avec le token associé
		const user = await authModel.findOne({ emailVerificationToken: token });

		if (!user) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Vérifier si le token n'a pas expiré
		if (user.emailVerificationTokenExpires && user.emailVerificationTokenExpires < Date.now()) {
			return res.status(400).json({ message: 'Le token à expiré' });
		}

		// Mettre à jour isEmailVerified à true et sauvegarder
		user.isEmailVerified = true;
		// Effacer le token après vérification
		user.emailVerificationToken = undefined;
		// Effacer la date d'expiration
		user.emailVerificationTokenExpires = undefined;
		// Sauvegarder
		await user.save();

		// Message de réussite
		res.status(200).json({ message: 'Email verifié avec succès' });
	} catch (error) {
		console.error("Erreur lors de la verification de l'email : ", error.message);
		res.status(500).json({ message: "Erreur lors de la vérification de l'email" });
	}
};

// Fonction pour la demande de réinitialisation de mot de passe par email
module.exports.forgotPassword = async (req, res) => {
	try {
		// Email rentré quand le mot de passe est oublié
		const { email } = req.body;

		// Rechercher l'utilisateur par email
		const user = await authModel.findOne({ email });

		// Condition si l'email ne correspond pas avec un user dans la BDD
		if (!user) {
			return res
				.status(404)
				.json({ message: 'Aucun utilisateur ne correspond avec cet email' });
		}

		// Générer un token de réinitialisation de mot de passe sécurisé
		const resetPasswordToken = generateVerificationTokenPassword();

		// Sauvegarder le token de réinitialisation de mot de passe et l'expiration dans la BDD
		user.resetPasswordToken = resetPasswordToken;
		user.resetPasswordTokenExpires = new Date(Date.now() + 60 * 60 * 1000);
		await user.save();

		// Envoyer un email avec le lien de réinitialisation de mot de passe
		await sendResetPassword(user.email, resetPasswordToken);

		// Message de réussite
		res.status(200).json({
			message: 'Email de réinitialisation de mot de passe envoyé avec success',
		});
	} catch (error) {
		console.error(
			'Erreur lors de la demande de réinitialisation de mot de passe',
			error.message
		);
		res.status(500).json({
			message: 'Erreur lors de la demande de réinitialisation de mot de passe',
		});
	}
};

// Fonction pour réinitialiser le mot de passe
module.exports.updatePassword = async (req, res) => {
	try {
		// Récupération du token pour le mettre en params url
		const { token } = req.params;
		// Ajout de deux nouveaux champs dans la requête
		const { newPassword, confirmNewPassword } = req.body;

		// Vérifier si les champs de mot de passe correspondent
		if (newPassword !== confirmNewPassword) {
			return res.status(400).json({ message: 'Les mot de passe ne correspondent pas' });
		}
		// Trouver l'utilisateur par le token de réinitialisation de mot de passe
		const user = await authModel.findOne({
			resetPasswordToken: token,
			resetPasswordTokenExpires: { $gt: Date.now() },
		});

		// Verifier si le token est valide
		if (!user) {
			return res.status(400).json({ message: 'token de réinitilisation invalide ou expiré' });
		}

		// Mettre à jour le mot de passe
		user.password = newPassword;

		// Réinitialiser le token et l'expiration
		user.resetPasswordToken = undefined;
		user.resetPasswordTokenExpires = undefined;

		// Enregister les modifications
		await user.save();

		// Envoyer une reponse de success
		res.status(200).json({ message: 'Mot de passe réinitialisé avec success' });
	} catch (error) {
		console.error('Erreur lors de la réinitialisation du mot de passe ', error.message);
		res.status(500).json({ message: 'Erreur lors de la réinitialisation du mot de passe' });
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

// Fonction pour la modification du profil
module.exports.update = async (req, res) => {
	try {
		// Déclaration de variable pour la gestion des erreurs de validation
		const errors = validationResult(req);

		// Vérification si il y a une des erreurs de validation
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Recupération de l'id de l'utilisateur pour le mettre en param de requête
		const userId = req.params.id;

		// Récupération des données du formulaire
		const { lastname, firstname, birthday, address, zipcode, city, phone, email, newPassword } =
			req.body;

		// Vérifié si l'utilisateur existe avant la mise à jour
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en base de données
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Verifier si une nouvelle image est télécharger, mettre à jour le chemin de l'image
		if (req.file) {
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle url et un nouvel id a l'image
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
		}

		// Mettre à jour les informations de l'utilisateur
		existingUser.lastname = lastname;
		existingUser.firstname = firstname;
		existingUser.birthday = birthday;
		existingUser.address = address;
		existingUser.zipcode = zipcode;
		existingUser.city = city;
		existingUser.phone = phone;

		// Mettre à jour l'email iniquement si fourni dans la requête
		if (email) {
			existingUser.email = email;
		}

		// Mettre a jour le mot de passe uniquement si fourni dans la requête
		if (newPassword) {
			existingUser.password = newPassword;
		}

		// Sauvergarder les modifications
		await existingUser.save();

		// Code de success
		res.status(200).json({ message: 'Profil mise à jour avec success', user: existingUser });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la mise à jour du profil' });
	}
};

// Fonction pour supprimer notre profil
module.exports.delete = async (req, res) => {
	try {
		// Déclaration de la variable qui va rechercher l'id user pour le mettre en params url
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier sur l'utilisateur existe
		const existingUser = await authModel.findById(userId);

		// Suppression de l'avatar de cloudinary si celui existe
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}
		// Supprimer l'utilisateur de la basse de données
		await authModel.findByIdAndDelete(userId);

		// Message de success
		res.status(200).json({ message: 'Utilisateur supprimé avec success' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
	}
};

// Fonction pour afficher tout les utilisateurs (admin)
module.exports.getAllUsers = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			// return d'un message d'erreur
			return res
				.status(403)
				.json({ message: 'Action non autorisée. Seul un admin peut modifier un produit' });
		}

		const user = await authModel.find();

		res.status(200).json({ message: 'Liste des users avec success', user });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs', error });
	}
};

// Fonction pour afficher un utilisateur avec son id (admin)
module.exports.getUserById = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			// Retourne un message d'erreur
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut modifier un produit',
			});
		}

		const userId = req.params.id;

		const user = await authModel.findById(userId);

		if (!user) {
			// Utilisateur non trouvé
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Utilisateur trouvé avec succès
		res.status(200).json({ message: 'Utilisateur trouvé avec succès!', user });
	} catch (error) {
		console.error('Erreur lors de la récupération des utilisateurs : ', error.message);
		res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
	}
};

// Fonction pour acceder à une route protégée (admin)
module.exports.dashboard = async (req, res) => {
	if (req.user.role === 'admin') {
		// Definition de req.isAdmin sera egal a true pour les administrateur
		req.isAdmin = true;
		// Envoyer une reponse de succes
		return res.status(200).json({ message: 'Bienvenue administrateur' });
	} else {
		//Envoyer une reponse pour les utilisateurs non admin
		return res.status(403).json({
			message: 'Action non autorisee, seul les administrateurs peuvent acceder a cette page',
		});
	}
};

// Fonction pour voir mon profil
module.exports.getProfile = async (req, res) => {
	try {
		const userId = req.params.id;

		const user = await authModel.findById(userId);

		if (!user) {
			res.status(404).json({ message: 'Profil utilisateur inexistant' });
		}

		// Utilisateur trouvé avec succès
		res.status(200).json({ message: 'Utilisateur trouvé avec succès!', user });
	} catch (err) {
		console.error('Erreur lors de la récupération des utilisateurs : ', err.message);
		res.status(500).json({ message: "Erreur lors de la récupération de l'utilisateur" });
	}
};

// fonction pour modifier un utilisateur (admin)
module.exports.updateUser = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			// Retourne un message d'erreur
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut modifier un utilisateur',
			});
		}
		// Déclaration de variable pour la gestion des erreurs de validation
		const errors = validationResult(req);

		// Vérification si il y a une des erreurs de validation
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// Recupération de l'id de l'utilisateur pour le mettre en param de requête
		const userId = req.params.id;

		// Récupération des données du formulaire
		const { lastname, firstname, birthday, address, zipcode, city, phone, email } = req.body;

		// Vérifié si l'utilisateur existe avant la mise à jour
		const existingUser = await authModel.findById(userId);

		// Condition si l'utilisateur n'existe pas en base de données
		if (!existingUser) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}

		// Verifier si une nouvelle image est télécharger, mettre à jour le chemin de l'image
		if (req.file) {
			if (existingUser.avatarPublicId) {
				await cloudinary.uploader.destroy(existingUser.avatarPublicId);
			}
			// Redonne une nouvelle url et un nouvel id a l'image
			existingUser.avatarUrl = req.cloudinaryUrl;
			existingUser.avatarPublicId = req.file.public_id;
		}

		// Mettre à jour les informations de l'utilisateur
		existingUser.lastname = lastname;
		existingUser.firstname = firstname;
		existingUser.birthday = birthday;
		existingUser.address = address;
		existingUser.zipcode = zipcode;
		existingUser.city = city;
		existingUser.phone = phone;

		// Mettre à jour l'email iniquement si fourni dans la requête
		if (email) {
			existingUser.email = email;
		}

		// Sauvergarder les modifications
		await existingUser.save();

		// Code de success
		res.status(200).json({
			message: "Profil de l'utilisateur mise à jour avec success",
			user: existingUser,
		});
	} catch (error) {
		console.error(error);
		res.status(500).json({
			message: "Erreur lors de la mise à jour du profil de l'utilisateur",
		});
	}
};

// Fonction pour supprimer un utilisateur (admin)
module.exports.deleteUser = async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			// Retourne un message d'erreur
			return res.status(403).json({
				message: 'Action non autorisée. Seul un admin peut supprimer un utilisateur',
			});
		}
		// Déclaration de la variable qui va rechercher l'id user pour le mettre en params url
		const userId = req.params.id;

		// Déclaration de variable qui va vérifier sur l'utilisateur existe
		const existingUser = await authModel.findById(userId);

		// Suppression de l'avatar de cloudinary si celui existe
		if (existingUser.avatarPublicId) {
			await cloudinary.uploader.destroy(existingUser.avatarPublicId);
		}
		// Supprimer l'utilisateur de la basse de données
		await authModel.findByIdAndDelete(userId);

		// Message de success
		res.status(200).json({ message: 'Utilisateur supprimé avec success' });
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: "Erreur lors de la suppression de l'utilisateur" });
	}
};
