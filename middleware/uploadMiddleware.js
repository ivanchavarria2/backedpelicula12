import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';

// Configuración para almacenar en memoria
const memoryStorage = multer.memoryStorage();

export const uploadToMemory = multer({
  storage: memoryStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // Límite de 2MB
  },
  fileFilter: (req, file, cb) => {
    // Validar tipos de archivo permitidos
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png, gif)'));
    }
  }
});

// Función para guardar archivo desde memoria a disco
export const saveFileFromMemory = async (fileBuffer, filename, directory) => {
  try {
    // Crear directorio si no existe
    await fs.mkdir(directory, { recursive: true });
    
    const filePath = path.join(directory, filename);
    await fs.writeFile(filePath, fileBuffer);
    
    return filePath;
  } catch (error) {
    throw new Error(`Error al guardar archivo: ${error.message}`);
  }
};