// Importation de mongoose
const mongoose = require('mongoose');
// importation de supertest
const request = require('supertest');
// importation de l'application
const app = require('../server');
// Import bcrypt
const bcrypt = require('bcryptjs');
// Importation du model
const authModel = require('../models/auth.model');
// Import JWT
const jwt = require('jsonwebtoken');

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

// Bloc de test pour la route de connexion
describe('Login route testing', () => {
	// Test spécifique pour vérifier que la route renvoie un jwt en cas de connexion réussie
	it('Should return a token if login succeeds', async () => {
		// On suppose que nous avons un utilisateur en base de données
		const existingUser = {
			_id: new mongoose.Types.ObjectId(),
			email: 'exemple@gmail.com',
			// Hachage du mot de passe pour simuler le stockage en BDD
			password: await bcrypt.hash('123456', 10),
		};
		// Simulation de la methode findOne pour renvoyer l'utilisateur existant lorsqu'elle est appelé
		jest.spyOn(authModel, 'findOne').mockResolvedValue(existingUser);
		// Effectuer la requête de connexion a la route /api/login
		const response = await request(app).post('/api/login').send({
			email: 'exemple@gmail.com',
			// Fournir le mot de passe en clair pour la comparaison
			password: '123456',
		});
		// Vérifier que la réponse est réussie
		expect(response.status).toBe(200);

		// Vérifier que la réponse contient un jeton
		expect(response.body).toHaveProperty('token');
		// Décoder le jeton pour verifier son contenu
		const decodedToken = jwt.verify(response.body.token, process.env.JWT_SECRET);
		// Verifier que le jeton contient les information attendues
		expect(decodedToken).toHaveProperty('user');
		expect(decodedToken.user).toHaveProperty('id', existingUser._id.toHexString());
		expect(decodedToken.user).toHaveProperty('email', existingUser.email);
	});
});
