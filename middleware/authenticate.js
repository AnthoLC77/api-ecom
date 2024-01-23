// Import du modèle utilisateur
const autheModel = require('../models/auth.model');
// Import du JWT
const jwt = require('jsonwebtoken');

// Fonction pour la gestion de rôle

module.exports.authenticate = async (req, res, next) => {
	try {
		// Definition de la variable pour l'autorisation
		const authHeader = req.header('Authorization');
		// Condition qui vérifie la variable et qui ajoute un bearer comme exeption
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message:
					"Vous devez être connecté en tant qu'administrateur pour acceder à cette page",
			});
		}
		// Extraction du token sans le prefixe 'Bearer'
		const token = authHeader.split(' ')[1];

		// Ajout de la variable pour decoder le token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		// Déclaration d'une variable qui va recuperer l'id de l'user et lui assigner un token
		const user = await autheModel.findById(decoded.userId);

		// Si il n'y a pas d'utilisateur renvoie un message
		if (!user) {
			return res.status(403).json({ message: 'Utilisateur non trouvé' });
		}
		// Le else n'est pas souhaitable car en locale tout vas fonctionner mais au déploiement il y aura une erreur "req.user is not a function"
		req.user = user;
		next();
	} catch (err) {
		console.error("Erreur lors de l'authentification : ", err.message);
		res.status(500).json({ message: "Erreur lors de l'authentification" });
	}
};

// Fonction pour valider le token d'authentification
module.exports.verifToken = async (req, res, next) => {
	try {
		// Definition de la variable pour l'autorisation
		const authHeader = req.header('Authorization');
		// Condition qui vérifie la variable et qui ajoute un bearer comme exeption
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({
				message: 'Vous devez être connecté pour éffectuer cette action sur votre profil',
			});
		}

		// Extraction du token sans le prefixe 'Bearer'
		const token = authHeader.split(' ')[1];

		// Vérifier la validité du token en utilisant JWT
		jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
			// Si une erreur survient pendant la vérification, renvoyer une erreur
			if (err) {
				return res.status(401).json({ message: 'Token invalide' });
			}
			// Si la vérification est réussie, ajouter les informations du token dans la requête
			req.tokenInfo = decoded;

			// Passer à la prochaine étape du mddlware ou à de la route
			next();
		});
	} catch (err) {
		console.error('Erreur lors de la récupération du token : ', err.message);
		res.status(500).json({ message: 'Erreur lors de la récupération du token' });
	}
};
