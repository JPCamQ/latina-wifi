// Importar multer para manejar upload de archivos
const multer = require('multer');
const path = require('path');

// Configurar dónde y cómo guardar los archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Los archivos se guardarán en esta carpeta
    cb(null, 'public/uploads/comprobantes/');
  },
  filename: function (req, file, cb) {
    // Crear un nombre único para el archivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    // Mantener la extensión original del archivo
    const fileExtension = path.extname(file.originalname);
    cb(null, 'comprobante-' + uniqueSuffix + fileExtension);
  }
});

// Filtrar tipos de archivo permitidos
const fileFilter = (req, file, cb) => {
  // Verificar si el archivo es una imagen o PDF
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true); // Aceptar archivo
  } else {
    cb(new Error('Solo se permiten imágenes JPG, PNG o PDF'), false); // Rechazar archivo
  }
};

// Configurar multer con nuestras opciones
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // Límite de 5MB
  }
});

module.exports = upload;