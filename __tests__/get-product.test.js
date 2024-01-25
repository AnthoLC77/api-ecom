// Import du module mongoose
const mongoose = require('mongoose');
// Import du module superTest
const request = require('supertest');
// Import de l'application
const app = require('../server');

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

// Bloc de test pour récuperer un produit
describe('Get product API', () => {
	it('Should get a specific products by ID', async () => {
		// Id du produit à recuperer
		const productIdToGet = '65b0e8c17005e5cda0870820';

		// Faire la demande pour recuperer un produit par son ID
		const response = await request(app).get(`/api/one-product/${productIdToGet}`);

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la demande est réussie
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('product');
	});
});
