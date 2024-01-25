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
describe('Update User API', () => {
	it('Should allow updating user profil for admin', async () => {
		// Id de l'utilisateur admin dans la base de données
		const adminUserId = '65af8bf4ff268149c68aaff8';

		// Id de l"user a vérifier
		const userIdToUpdate = '65b0deb90b110bf697f44691';

		const authToken = generateAuthToken(adminUserId);

		// Faire la demande pour recuperer tout les users
		const response = await request(app)
			.put(`/api/update-user/${userIdToUpdate}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'NouveauNom2',
				firstname: 'NouveauPrenom2',
				birthday: '11/09/1980',
				address: 'NouvelleAddress',
				zipcode: '98563',
				city: 'NouvelleVille',
				phone: '0807090605',
				email: 'newemail@gmail.com',
			});

		// Log de la réponse
		console.log(response.body);

		// S'assurer que la demande est réussie
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty(
			'message',
			"Profil de l'utilisateur mise à jour avec success"
		);
		expect(response.body).toHaveProperty('user');

		// S'assurer que les information de l'utilisateur ont bien été mis à jour !
		const updateUser = await authModel.findById(userIdToUpdate);
		expect(updateUser.lastname).toBe('NouveauNom2');
		expect(updateUser.firstname).toBe('NouveauPrenom2');
		expect(updateUser.birthday).toBe('11/09/1980');
		expect(updateUser.address).toBe('NouvelleAddress');
		expect(updateUser.zipcode).toBe('98563');
		expect(updateUser.city).toBe('NouvelleVille');
		expect(updateUser.phone).toBe('0807090605');
		expect(updateUser.email).toBe('newemail@gmail.com');
	});
});
