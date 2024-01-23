// Import de mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import app
const app = require('../server');

// Bloc de test pour verifier la route /api/profile/:id
describe('Get Profile API', () => {
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
	// Test vérifiant que la route /api/profile/:id renvoie le profil de l'utilisateur connecté
	it('Should return profile of the authenticated user', async () => {
		// Effectué la connexion et récuperer le token
		const loginResponse = await request(app).post('/api/login').send({
			email: 'daytwo@gmail.com',
			password: '123456',
		});
		// Vérifier que la connexion est réussie
		expect(loginResponse.status).toBe(200);
		expect(loginResponse.body).toHaveProperty('token');

		// Récuperer le token pour le test suivant
		const authToken = loginResponse.body.token;

		// Déclaration variable utilisateur avec son id
		const userId = '65af8bf4ff268149c68aaff8';

		// Test pour vérifier que la route /api/profile/:id renvoie le profil de l'utilisateur connecté
		const responseProfil = await request(app)
			.get(`/api/profile/${userId}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Vérifier que la réponse est réussie
		expect(responseProfil.status).toBe(200);

		// Afficher l'utilisateur dans la console
		console.log('Utilisateur récupére: ', responseProfil.body.user);
	});
});
