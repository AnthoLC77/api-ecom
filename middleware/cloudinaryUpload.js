/// Import du package multer
const multer = require('multer');
// Import du package cloudinary
const cloudinary = require('cloudinary').v2;
// Configuration de multer pour stocker les images dans un dossier spécifique
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const cloudinaryUpload = async (req, res, next) => {
	try {
		console.log('début du middleware cloudinaryUpload');
		// Utilisation de multer pour gérer le fichier depuis la requête
		upload.single('image')(req, res, async (err) => {
			console.log('Multer a terminé de gérer le fichier');

			// Gestion des erreurs Multer
			if (err) {
				console.error('Erreur lors du téleversement avec Multer : ', err);
				return res
					.status(500)
					.json({ message: 'Erreur lors du tévéversement avec Multer' });
			}
			// Vérification de l'existence du fichier dans la requête
			if (!req.file) {
				return res.status(400).json({ message: 'Veuillez télécharger une image' });
			}
			try {
				console.log('Début du téléversement sur cloudinary');

				// Utilisation de cloudinary pour téléverser l'image
				cloudinary.uploader
					.upload_stream(async (error, result) => {
						// Gestion des erreurs Cloudinary
						if (error) {
							console.error('Erreur lors du téleversement sur Cloudinary : ', error);
							return res
								.status(500)
								.json({ message: 'Erreur lors du tévéversement sur Cloudinary' });
						}
						console.log('Téléversement sur Cloudinary réussi');

						// Ajout de l'url de l'image cloudinary à la requête
						req.cloudinaryUrl = result.secure_url;
						// Ajout du public_id de l'image à la requête
						req.file.public_id = result.public_id;

						// Passe à la prochaine étape du middleware ou à la route
						next();
					})
					.end(req.file.buffer);

				console.log('Fin du middleware cloudinaryUpload');
			} catch (cloudinaryError) {
				console.error('Erreur lors du téléversement sur cloudinary : ', cloudinaryError);
				res.status(500).json({ message: 'Erreur lors du téléversment sur cloudinary' });
			}
		});
	} catch (error) {
		console.error('Erreur non traitée dans le middleware cloudinary : ', error);
		res.status(500).json({ message: 'Erreur non traitée dans le middleware cloudinary' });
	}
};

module.exports = cloudinaryUpload;
