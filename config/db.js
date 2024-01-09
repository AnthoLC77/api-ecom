// On importe mongoose
const mongoose = require("mongoose");

// Definition de l'url de connection a la base donnees
const url = process.env.MONGO_URI;

const connectDB = () => {
  mongoose
    .connect(url)
    // Le .then est une  promesses qui permet de gerer la connection a la base de donnees et le .catch pertmet de gerer et capturer les erreurs.
    .then(() => {
      console.log("Connection a la base de donnees reussie");
    })
    .catch((err) => {
      console.error(
        "Erreur de connection avec la base de donnees",
        err.message
      );
    });
};

// Export de la fonction connectDB
module.exports = connectDB;
