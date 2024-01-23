// Import de mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import app
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
// Bloc de test pour la route update-password
describe('Update password API', () => {
	// Variable pour stocker le token
	let resetPasswordToken;
	// Avant tous les test récuperer un utilisateur avec un token valide dans la BDD
	beforeAll(async () => {
		const user = await authModel.findOne({
			email: 'dayone@gmail.com',
		});
		// Vérification  de l'utilisateur
		if (user) {
			resetPasswordToken = user.resetPasswordToken;
		}
	});
	// Tests vérifiant que la route renvoie un code 400 si les mots de passes ne correspondent pas
	it('Should return status code 400 if password do not match', async () => {
		const response = await request(app).put(`/api/update-password/${resetPasswordToken}`).send({
			newPassword: 'newPassword',
			confirmNewPassword: 'differentPassword',
		});
		// Vérifie que la réponse attendu est 400
		expect(response.status).toBe(400);
	});
	// Test vérifiant que la route renvoie un code 400 si le token est invalide
	it('Should return status code 400 if reset password token is invalide', async () => {
		const response = await request(app).put(`/api/update-password/invalid-token`).send({
			newPassword: 'newPassword',
			confirmNewPassword: 'differentPassword',
		});
		// Vérifie que la réponse attendu est 400
		expect(response.status).toBe(400);
	});
	// Test vérifiant que la route renvoie un code 200
	it('Should return status code 200 if password is successfully reset', async () => {
		// S'assurer que le resetPasswordToken est défini avant le test
		console.log('reset password token: ', resetPasswordToken);
		if (resetPasswordToken) {
			const response = await request(app)
				.put(`/api/update-password/${resetPasswordToken}`)
				.send({
					newPassword: 'qwerty123',
					confirmNewPassword: 'qwerty123',
				});

			// Afficher la réponse dans la console
			console.log('response body:', response.body);

			// Vérifie que la réponse attendue est 200
			expect(response.status).toBe(200);
		}
	});
});
