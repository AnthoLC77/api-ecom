# Utilisation de l'image de Node.js
FROM node:18

# Creation du repertoire de travail dans l'image
WORKDIR /usr/src/app

# Copie des fichiers package.json et package-lock.json pour installer les dependances
COPY package*.json yarn.lock* ./

# Installation des dependances
RUN yarn install

# Copie du code source de l'application dans l'image
COPY . .

# Exposer le port sur lequel votre ordinateur ecoute
EXPOSE 5000

# Commande pour demarrer votre application Node.js
CMD ["yarn", "start"]