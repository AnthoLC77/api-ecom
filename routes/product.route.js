const router = require('express').Router();
const productController = require('../controllers/product.controller');
const authMiddleware = require('../middleware/authenticate');
const CloudinaryUpload = require('../middleware/cloudinaryUpload');

// Route pour la creation d'un produit en tant qu'admin en prenant en compte le authMiddleware.authenticate
router.post(
	'/api/create-product',
	authMiddleware.authenticate,
	CloudinaryUpload,
	productController.createProduct
);

// Route pour recupérer tout les produits
router.get('/api/all-products', productController.getAllProducts);
// Route pour recupérer un seul produit avec son ID
router.get('/api/one-product/:id', productController.getProductsById);
// Route pour supprimer un produit avec son id
router.delete('/api/delete-product/:id', authMiddleware.authenticate, productController.deleteProduct);
// Route pour modifier un produit avec son id
router.put(
	'/api/update-product/:id',
	authMiddleware.authenticate,
	CloudinaryUpload,
	productController.updateProduct
);

// Export du router
module.exports = router;
