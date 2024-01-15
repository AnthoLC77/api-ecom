const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');

// Route pour l'inscription
router.post('/register', authController.register);

// Route pour connexion
router.post('/login', authController.login);

// Route pour le mot de passe oublié 

// Route protegee
router.get('/dashboard', authMiddleware.authenticate, (req, res) => {
	// Verifier si l"utilisateur est un admin
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
});

module.exports = router;
