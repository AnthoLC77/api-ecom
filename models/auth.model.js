// Import de mongoose pour la gestion avec la base de données
const mongoose = require('mongoose');
// Import de Bcrypt pour la hachage de mot de passe
const bcrypt = require('bcryptjs');
// Import de validator pour la validation de l'email
const validator = require('validator');
// Import de cloudinary
const cloudinary = require('cloudinary').v2;

// Définition du schema de l'utilisateur
const authSchema = new mongoose.Schema({
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

	address: {
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
		type: Number,
		required: true,
	},

	avatarUrl: {
		type: String,
	},

	avatarPublicId: {
		type: String,
		default: null,
	},

	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		validate: {
			validator: (value) => validator.isEmail(value),
			message: 'Adresse email invalide',
		},
	},
	password: {
		type: String,
		required: [true, 'Veuillez renseigner un mot de passe'],
	},

	role: {
		type: String,
		enum: ['user', 'admin'],
		default: 'user',
	},

	isEmailVerified: {
		type: Boolean,
		defaut: false,
	},

	emailVerificationToken: {
		type: String,
	},

	emailVerificationTokenExpires: {
		type: Date,
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

// Hachage du mot de passe avant de sauvegarder l'utilisateur
authSchema.pre('save', async function (next) {
	try {
		if (!this.isModified('password')) {
			return next();
		}
		const hashedPassword = await bcrypt.hash(this.password, 10);
		this.password = hashedPassword;
		return next();
	} catch (error) {
		return next(error);
	}
});

// Méthode pour comparer le mot de passe
authSchema.method.comparePassword = async function (paramPassword) {
	try {
		return await bcrypt.compare(paramPassword, this.password);
	} catch (error) {
		throw new Error(error);
	}
};

// Export du modèle, du schema et mis dans la variable Auth
const Auth = mongoose.model('Auth', authSchema);

// Export de la variable User
module.exports = Auth;
