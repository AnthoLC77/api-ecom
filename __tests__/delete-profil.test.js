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
function generateAuthToken(userId) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de la bibliothèque jwt pour générer le token
	return jwt.sign({ userId }, secretKey, { expiresIn });
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
describe('Delete Profile API', () => {
	it('Should allow deleting user profil for admin', async () => {
		// Id du profil utilisateur à supprimer
		const userIdToDelete = '65b0d8a47c60c09ecb180d60';

		const authToken = generateAuthToken(userIdToDelete);

		// Faire la demande pour recuperer tout les users
		const response = await request(app)
			.delete(`/api/delete/${userIdToDelete}`)
			.set('Authorization', `Bearer ${authToken}`);

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la demande est réussie
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Profil supprimé avec success');

		// S'assurer que le profil utilisateur à bien été supprimé de la BDD!
		const deleteUser = await authModel.findById(userIdToDelete);
		expect(deleteUser).toBeNull();
	});
});
