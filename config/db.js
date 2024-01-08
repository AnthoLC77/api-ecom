// On importe mongoose
const mongoose = require("mongoose");

const connectDB = () => {
  return mongoose.connect(process.env.MONGO_URI);
};

// Export de la fonction connectDB
module.exports = connectDB;
