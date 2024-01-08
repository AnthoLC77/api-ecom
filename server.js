// Chargement des variables d'environnement
require("dotenv").config();

// Import des modules nécessaires
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

// Import des routes pour l'authentification

// Import de la configuration de la base de données

// Initialisation de l'application Express
const app = express();

// Middleware pour traiter les requêtes JSON
app.use(express.json());

// Middleware pour parser les corps de requêtes
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Utilisation  des routes pour l'authentification

// Configuration des options cors
const corsOptions = {
  credentials: true,
  optionsSuccessStatus: 200,
  methods: "GET, POST, PUT, DELETE, PATCH, HEAD",
  preflightContinue: false,
};

// Définition du port de demarrage du serveur
const PORT = process.env.PORT || 5200;

// Fonction pour demarrer le serveur
const start = async () => {
  try {
    // Connecion a la base de données
    // Demarrage du serveur le port spécifié
    app.listen(PORT, () => console.log(`Le serveur à démarrer sur le ${PORT}`));
  } catch (error) {
    console.log(error);
  }
};

// Appel de la fonction pour demarrer le serveur
start();
