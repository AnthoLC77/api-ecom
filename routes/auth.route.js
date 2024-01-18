const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/authenticate');
const cloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour l'inscription
router.post('/register', cloudinaryUpload, authController.register);

// Route pour vérifier l'email de validation
router.get('/verify-email/:token', authController.verifyEmail);

// Route pour envoyer un email de réinitialisation de mot de passe
router.post('/forgot-password', authController.forgotPassword);

// Route pour connexion
router.post('/login', authController.login);

// Route pour la modification du profil
router.put('/update/:id', authMiddleware.verifToken, cloudinaryUpload, authController.update);

// Route pour supprimer notre profil
router.delete('/delete/:id', authMiddleware.verifToken, authController.delete);

// Route pour afficher tout les utilisateur (admin)
router.get('/all-users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour afficher un utilisateur par son ID (admin)
router.get('/one-user/:id', authMiddleware.authenticate, authController.getUserById);

// Route pour modifier le profil d'un utilisateur (admin)
router.put(
	'/update-user/:id',
	authMiddleware.authenticate,
	cloudinaryUpload,
	authController.updateUser
);

// Route pour supprimer le profil d'un utilisateur (admin)
router.delete('/delete-user/:id', authMiddleware.authenticate, authController.deleteUser);

// Route pour afficher son profil
router.get('/profile/:id', authMiddleware.verifToken, authController.getProfile);

// Route proteger dashboard
router.get('/dashboard', authMiddleware.authenticate, authController.dashboard);

module.exports = router;
