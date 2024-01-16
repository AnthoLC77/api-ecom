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

// Route pour afficher tout les utilisateur
router.get('/all-users', authMiddleware.authenticate, authController.getAllUsers);

// Route pour afficher un utilisateur par son ID
router.get('/one-user/:id', authMiddleware.authenticate, authController.getUserById);

// Afficher le profil d'un user
router.get('/profil-user/:id', authController.getProfilUser);

// Route proteger dashboard
router.get('/dashboard', authMiddleware.authenticate, authController.dashboard);

module.exports = router;
