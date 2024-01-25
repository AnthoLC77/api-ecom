// Import du module mongoose
const mongoose = require('mongoose');
// Import du module superTest
const request = require('supertest');
// Import de l'application
const app = require('../server');
// Import de jwt
const jwt = require('jsonwebtoken');
// Import model
const authModel = require('../models/auth.model');

// Fonction utilitaire pour generer un token d'authentification
function generateAuthToken(userId, role) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jwt pour générer le token
	return jwt.sign({ user: { id: userId }, role }, secretKey, { expiresIn });
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

// Bloc de test pour vérifier si je peux accéder au dashboard en tant qu'administrateur
describe('Dashboard API', () => {
	it('Should allow access to the dashboard for admin', async () => {
		// Id de l'utilisateur admin dans la Bdd
		const adminUserId = '65af8bf4ff268149c68aaff8';

		// Générer un token pour l'admin
		const authToken = generateAuthToken(adminUserId, 'admin');
		// Faire la demande pour acceder au dashboard
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse
		console.log(response.body);

		// S'assurer de la réussite de la demande
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Bienvenue administrateur');
	});
	// Test si l'utilisateur n'a pas le rôle admin
	it('Should return an error for non-admin users trying to access the dashboard', async () => {
		// Id d'un utilisateur non admin dans la base de données
		const nonAdminUserId = '65ae669c1388cee182fde8a3';

		// Génération d'un token
		const authToken = generateAuthToken(nonAdminUserId, 'user');
		// Faire la demande pour acceder au dashboard
		const response = await request(app)
			.get('/api/dashboard')
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la réponse est un 403
		expect(response.status).toBe(403);
		expect(response.body).toHaveProperty('message', 'Utilisateur non trouvé');
	});
});
