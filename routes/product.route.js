const router = require('express').Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authenticate');
const upload = require('../middleware/upload');

// Route pour la creation d'un produit en tant qu'admin en prenant en compte le authMiddleware.authenticate

router.post(
	'/create-product',
	authMiddleware.authenticate,
	upload.single('image'),
	productController.createProduct
);

module.exports = router;
