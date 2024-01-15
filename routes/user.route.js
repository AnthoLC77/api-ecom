const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const userController = require('../controllers/user.controller');
const authMiddleware = require('../middleware/authenticate');

const cloudinaryUpload = require('../middleware/cloudinaryUpload');

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
