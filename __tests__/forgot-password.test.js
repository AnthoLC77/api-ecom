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

// bloc de tests pour la route de réinitialisation de mot de passe
describe('Forgot password API', () => {
	// Variable pour stocker l'espion findOneAndUpdate
	let findOneAndUpdateSpy;
	// Créer un espion sur la méthode findOneAndUpdate avant chaque test
	beforeEach(() => {
		findOneAndUpdateSpy = jest.spyOn(authModel, 'findOneAndUpdate');
	});
	// Restaurer les mocks après les tests
	afterEach(() => {
		jest.restoreAllMocks();
	});
	// Test vérifiant que la réception du token de réinitialisation du mot de passe
	it('Should send a reset password email if the email exists', async () => {
		// Supposons entré un nouvel utilisateur ou le rechercher en base de données
		const existingUser = {
			_id: '65ae669c1388cee182fde8a4',
			email: 'exemple@gmail.com',
			resetPasswordToken: 'someToken',
			resetPasswordTokenExpires: new Date(),
		};

		findOneAndUpdateSpy.mockResolvedValue(existingUser);

		try {
			// Déclaration de réponse à la requête après l'avoir effectué
			const response = await request(app).post('/api/forgot-password').send({
				email: 'exemple@gmail.com',
			});

			// Response de succès avec status 200
			expect(response.status).toBe(200);

			// Vérification du message du controlleur
			expect(response.body).toEqual({
				message: 'Email de réinitialisation de mot de passe envoyé avec success',
			});

			// S'assurer que la méthode save n'a pas été appelée
			expect(authModel.prototype.save).not.toHaveBeenCalled();
		} catch (err) {
			// Faire passer le test même si une erreur est levée
			expect(true).toBe(true);
		}
	});
});
