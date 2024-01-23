// Import du module superTest
const request = require('supertest');
// Import du module mongoose
const mongoose = require('mongoose');
// Import de l'application
const app = require('../server');
// Import de path
const path = require('path');

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
// Bloc de tests pour la route d'inscription
describe('Register route testing', () => {
	// Tests spécifique pour la création d'un utilisateur
	it("Devrait retourner 200 si l'utilisateur est crée avec success ", async () => {
		// Utilisation de supertest pour envoyer une requête
		const response = await request(app)
			.post('/api/register')
			// Remplissage des champs du formulaire
			.field('lastname', 'Fourner')
			.field('firstname', 'Ludovic')
			.field('birthday', '16/05/2000')
			.field('address', '31 rue du commerce')
			.field('zipcode', '77420')
			.field('city', 'Torcy')
			.field('phone', '0102030405')
			.field('email', 'te@gmail.com')
			.field('password', '123456')
			// Attache un fichier à la requête (exemple image)
			.attach('image', path.resolve(__dirname, '../images/shoes.jpg'));
		// Affichage de la réponse reçue dans la console
		console.log('Reponse reçue', response.body);
		// Assertion vérifiant que le status de ma réponse est 201
		expect(response.status).toBe(201);
		// Assertion vérifiant que la propiété message contient le message attendu
		expect(response.body).toHaveProperty(
			'message',
			`Utilisateur crée avec succès, verifier votre email pour valider votre compte : `
		);
	});
});
