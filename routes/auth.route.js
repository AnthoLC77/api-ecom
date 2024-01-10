const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');

// Route pour l'inscription
router.post('/register', authController.register);
// Route pour la connexion
router.post('/login', authController.login);
// Route protégée
router.get('/dashboard', authMiddleware.authenticate, (req, res) => {
	// Verifier si l'utilisateur est un admin
	if (req.user.role === admin) {
		// Definition de req.isAdmin sera égal à true pour les admins
		req.isAdmin = true;
		// Envoyer une réponse avec success
		return res.status(200).json({ message: 'Bienvenue admin !' });
	} else {
		// Envoyer une réponse pour les utilisateurs non admin
		res.status(403).json({
			message: 'Action non autorisée, seus les admin peuvent acceder à cette page',
		});
	}
});

module.exports = router;
