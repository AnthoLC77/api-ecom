// Import de mongoose
const mongoose = require('mongoose');
// Import supertest
const request = require('supertest');
// Import app
const app = require('../server');
// Import du JWT
const jwt = require('jsonwebtoken');
// Import du model
const authModel = require('../models/auth.model');

// Mock de la méthode de cloudinary pour éviter de supprimer réélement les fichiers lors des tests
jest.mock('cloudinary');
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

// Fonction utilitaire pour générer un token d'authentification
function generateAuthToken(user) {
	const secretKey = process.env.JWT_SECRET;
	const expiresIn = '1h';

	// Utilisation de jwt pour générer le token
	return jwt.sign({ userId: user._id }, secretKey, { expiresIn });
}

// Bloc de test pour la route de mis à jour du profil
describe('Update Profile API', () => {
	it('Should update the user profil', async () => {
		// Entrer l'utilisateur existant en base de données (id)
		const existingUserId = '65b0deb90b110bf697f44691';
		const existingUser = await authModel.findById(existingUserId);

		expect(existingUser).toBeDefined();

		// Générer un token
		const authToken = generateAuthToken(existingUser);

		// Utiliser supertest pour envoyer une requête PUT
		const response = await request(app)
			.put(`/api/update/${existingUserId}`)
			.set('Authorization', `Bearer ${authToken}`)
			.send({
				lastname: 'John',
				firstname: 'Doe',
				birthday: '11/03/2015',
				address: 'Rue du con',
				zipcode: '77896',
				city: 'Toux',
				phone: '0104050809',
				email: 'days@gmail.com',
			});
		// Afficher le corps de la réponse en cas d'echec
		if (response.status !== 200) {
			console.error(response.body);
		}

		//S'assurer que la réponse est 200
		expect(response.status).toBe(200);
		expect(response.body).toHaveProperty('message', 'Profil mise à jour avec success');
		expect(response.body).toHaveProperty('user');
	});
});
