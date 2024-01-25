// Import mongoose
const mongoose = require('mongoose');
// Import request
const request = require('supertest');
// Import de l'application
const app = require('../server');
// Import jwt
const jwt = require('jsonwebtoken');
// Import model
const productModel = require('../models/product.model');
// Import path
const path = require('path');

// Fonction utilitaire pour générer un token
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	return jwt.sign({ user: { id: userId } }, secretKey, { expiresIn });
}

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

// Bloc de test pour créer un produit avec le role admin
describe('Creater Product API', () => {
	it('Should create product if role is admin', async () => {
		// Déclaration de variable qui contientl'id de l'admin
		const adminIdToCreate = '65af8bf4ff268149c68aaff8';

		// Générer un token pour l'admin
		const authToken = generateAuthToken(adminIdToCreate);

		// Utilisation de supertest pour envoyer une requête
		const response = await request(app)
			.post('/api/create-product')
			// Remplissage des champs du formulaire produit
			.field('title', 'Chaussures')
			.field('description', 'Chaussures pour adulte')
			.field('price', '29.99')
			.attach('image', path.resolve(__dirname, '../images/shoes.jpg'))
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la demande est réussi (200)
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Produit ajouté avec success');
	});
});
