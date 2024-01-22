// Importation du module mongoose
const mongoose = require('mongoose');
// Chargements des variables d'environnement
require('dotenv').config();
// Connexion à la base de données avant l'execution de tout les tests
beforeAll(async () => {
	// Utilisation de la methode connect de mongoose pour établir la connexion à la base de données
	await mongoose.connect(process.env.MONGO_URI);
});

// Fermeture de la connexion à la base de données après execution de tous les tests
afterAll(async () => {
	// Utilisation de la méthode close de mongoose pour ferme la connexion à la base de données
	await mongoose.connection.close();
});
// Test vérifiant que la connexion à la base de données est bien établie
test('should connect to the database', async () => {
	// La propriété readyState de l'objet mongoose.connection est évalué à lorsque la connexion sera établie
	const isConnected = mongoose.connection.readyState === 1;
	// Assertion vérifiant que la connexion à la base de données est bien établie
	expect(isConnected).toBeTruthy();
});
