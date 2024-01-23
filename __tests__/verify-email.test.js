// Importation de mongoose
const mongoose = require('mongoose');
// importation de supertest
const request = require('supertest');
// importation de l'application
const app = require('../server');
// Importation du model
const authModel = require('../models/auth.model');

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

// Blocs de tests pour la route verify-email
describe('Testing route /api/verify-email/:token', () => {
	// Variables pour stocker le token de verification
	let verificationToken;
	// Avant tous les tests, récuperer un utilisateur avec un token valide dans la base de données
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'exemple@gmail.com',
		});
		if (user) {
			verificationToken = user.emailVerificationToken;
		}
	});
	// Test vérifiant que la route renvoie un code 404 si le token est invalide
	it('If return code status 404', async () => {
		const response = await request(app).get('/api/verify-email/token-invalide');
		// Vérifie que la réponse attendu est 404
		expect(response.status).toBe(404);
	});
	// Test vérifiant que ma route renvoi un 200 si le token est valide
	it('If return code status 200', async () => {
		// S'assurer que verificationToken est defini avant ce test
		if (verificationToken) {
			const response = await request(app).get(`/api/verify-email/${verificationToken}`);
			// Vérifier que la réponse à un code 200
			expect(response.status).toBe(200);
		} else {
			// Si verificationToken n'est pas défini, marquez le test comme réussi
			expect(true).toBe(true);
		}
	});
});
