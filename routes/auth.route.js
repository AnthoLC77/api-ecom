const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription
router.post('/register', cloudinaryUpload, authController.register);

// Route pour connexion
router.post('/login', authController.login);

// Route pour la modification du profil
router.put('/update/:id', cloudinaryUpload, authController.update);

// Route pour supprimer un utilisateur
router.delete('/delete/:id', authController.delete);

// Route proteger
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

// Admin
// Route pour ajouter mes informations
// Route pour voir mes informations
// Route pour modifier mes informations
// Route pour supprimer mon compte

// Admin 2
// Route pour voir tout un utilisateur
// Route pour supprimer les utilisateurs
// Route pour modifier un utilisateur

// User
// Route pour ajouter mes informations
// Route pour voir mes informations
// Route pour modifier mes informations
// Route pour supprimer mon compte

module.exports = router;
