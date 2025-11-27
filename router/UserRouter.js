import express from 'express';
import {
  login,
  updateUsersPassword,
  updateUsersEmail,
  getUsers,
  createUsers,
  updateUsers,
  deleteUsers,
  getOneUser
} from '../controller/UserController.js';

import { verifyToken } from '../middleware/auth.js';
import { uploadToMemory } from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Obtener todos los usuarios (protegido con token)
router.get('/user', verifyToken, getUsers);

// Obtener un usuario por id (protegido)
router.get('/user/:id', verifyToken, getOneUser);

// Registrar usuario (si quieres subir archivo, se aplica el middleware)
router.post(
  '/register',
  uploadToMemory.single('logo'),  // si no usas archivo, puedes quitar este middleware
  createUsers
);

// Actualizar datos de usuario
router.put('/user/:id', verifyToken, updateUsers);

// Eliminar usuario (soft delete)
router.delete('/user/:id', verifyToken, deleteUsers);

// Login (no necesita token)
router.post('/login', login);

// Actualizar email
router.put('/user/email/:id', verifyToken, updateUsersEmail);

// Actualizar password
router.put('/user/password/:id', verifyToken, updateUsersPassword);

// Exportar router (con tu mismo nombre)
export const RouterUsuer = router;
