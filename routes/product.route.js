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

// Route pour recupérer tout les produits
router.get('/all-products', productController.getAllProducts);
// Route pour recupérer un seul produit avec son ID
router.get('/one-product/:id', productController.getProductsById);
// Route pour supprimer un produit avec son id
router.delete('/delete-product/:id', authMiddleware.authenticate, productController.deleteProduct);
// Route pour modifier un produit avec son id
router.put(
	'/update-product/:id',
	authMiddleware.authenticate,
	upload.single('image'),
	productController.updateProduct
);

// Export du router
module.exports = router;
