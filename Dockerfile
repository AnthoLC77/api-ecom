# Utilisation de l'image Node.js
FROM node:18    

# Création du répertoire de travail dans l'image
WORKDIR /usr/src/app

# Copie des fichiers package.json et package-lock pour installer les dépendances 
COPY package*.json ./

# Installation des dépendances 
RUN yarn install

# Copie du code source de l'application dans l'image 
COPY . . 

# Exposer le port sur lequel votre application écoute
EXPOSE 5200

# Commande pour démarrer votre applications Node.js
CMD ["node", "server.js"]