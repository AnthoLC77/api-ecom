// Import du module mongoose
const mongoose = require('mongoose');
// Import du module superTest
const request = require('supertest');
// Import de l'application
const app = require('../server');
// Import de jwt
const jwt = require('jsonwebtoken');
// Import model
const authModel = require('../models/product.model');

// Fonction utilitaire pour generer un token d'authentification
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jwt pour générer le token
	return jwt.sign({ user: { id: userId } }, secretKey, { expiresIn });
}

// Connexion à la base de données avant l'execution des tests
beforeAll(async () => {
	// Utilisation de la méthode connect de mongoose
	await mongoose.connect(process.env.MONGO_URI);
	// Attente d'une seconde pour assurer la connection à la base de données
	await new Promise((resolve) => setTimeout(resolve, 1000));
});

// Fermeture de la connexion après execution des test
afterAll(async () => {
	// Utilisation de la methode close de moongose pour fermer la connexion
	await mongoose.connection.close();
});

// Bloc de test pour récuperer tout les utilisateurs
describe('Update Product API', () => {
	it('Should allow updating product for admin', async () => {
		// Id de l'utilisateur admin dans la base de données
		const adminUserId = '65af8bf4ff268149c68aaff8';

		// Id de l"user a vérifier
		const productIdToUpdate = '65b0ea1d5c0a65527d30f047';

		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour recuperer tout les users
		const response = await request(app)
			.put(`/api/update-product/${productIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				title: 'NouveauTitre',
				description: 'NouvelleDescription',
				price: '30',
			});

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la demande est réussie
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty(
			'message',
			'Modification du produit effectué avec success !'
		);
		expect(response.body).toHaveProperty('product');

		// S'assurer que les information de l'utilisateur ont bien été mis à jour !
		const updateProduct = await authModel.findById(productIdToUpdate);
		expect(updateProduct.title).toBe('NouveauTitre');
		expect(updateProduct.description).toBe('NouvelleDescription');
		expect(updateProduct.price).toBe('30');
	});
});
