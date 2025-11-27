// Controller usuario
import { UserModel } from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { TOKEN_KEY } from "../config/config.js";
import { saveFileFromMemory } from "../middleware/uploadMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";

// Para obtener __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================== OBTENER USUARIOS ======================
export const getUsers = async (req, res) => {
  try {
    const users = await UserModel.findAll({
      attributes: ["id", "user", "email", "typeusers_id"],
      where: { state: true },
    });

    return res.status(200).json({ users });
  } catch (error) {
    console.error("getUsers:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== OBTENER UN USUARIO ======================
export const getOneUser = async (req, res) => {
  try {
    const user = await UserModel.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    return res.status(200).json({ user });
  } catch (error) {
    console.error("getOneUser:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== CREAR USUARIO ======================
export const createUsers = async (req, res) => {
  try {
    const { user, email, password } = req.body;

    // Validar campos (con AND, no OR)
    if (!(user && email && password)) {
      return res.status(400).json({ message: "all input is required" });
    }

    // Validar si el email ya existe
    const oldUser = await UserModel.findOne({ where: { email } });
    if (oldUser) {
      return res.status(409).json("email already exist");
    }

    // ---------- MANEJO DE IMAGEN (AQUÍ SÍ VA, DENTRO DE LA FUNCIÓN) ----------
    let imagePath = null;

    if (req.file) {
      try {
        const filename = `${Date.now()}-${req.file.originalname}`;
        const uploadDir = path.join(__dirname, "..", "uploads", "imagenes");

        // Guardar archivo desde memoria a disco
        await saveFileFromMemory(req.file.buffer, filename, uploadDir);
        imagePath = `/uploads/imagenes/${filename}`;
      } catch (fileError) {
        console.error("createUsers - fileError:", fileError.message);
        return res.status(500).json({
          message: "Error al guardar el archivo",
          error: fileError.message,
        });
      }
    }
    // ------------------------------------------------------------------------

    // Encriptar contraseña
    const encryptedPassword = await bcrypt.hash(password.toString(), 10);

    // Crear usuario
    const users = await UserModel.create({
      user,
      email: email.toLowerCase(), // sanitize
      password: encryptedPassword,
      imagen: imagePath, // si tienes este campo en el modelo
      typeusers_id: 1,
    });

    // Crear token
    const token = jwt.sign(
      { user_id: users.id, email: users.email },
      TOKEN_KEY,
      { expiresIn: "1h" }
    );

    return res.status(201).json({ users, token });
  } catch (error) {
    console.error("createUsers:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== ACTUALIZAR NOMBRE ======================
export const updateUsers = async (req, res) => {
  try {
    const { user } = req.body;
    if (!user) {
      return res.status(400).json({ message: "user is required" });
    }

    const userD = await UserModel.findOne({ where: { id: req.params.id } });

    if (!userD) {
      return res.status(404).json({ message: "user not found" });
    }

    userD.user = user;
    await userD.save();

    return res.status(200).json({ message: "update" });
  } catch (error) {
    console.error("updateUsers:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== ACTUALIZAR EMAIL ======================
export const updateUsersEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const oldUser = await UserModel.findOne({ where: { email } });
    if (oldUser) {
      return res.status(409).json("email already exist");
    }

    const userD = await UserModel.findOne({ where: { id: req.params.id } });

    if (!userD) {
      return res.status(404).json({ message: "user not found" });
    }

    userD.email = email;
    await userD.save();

    return res.status(200).json({ message: "update" });
  } catch (error) {
    console.error("updateUsersEmail:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== ACTUALIZAR PASSWORD ======================
export const updateUsersPassword = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ message: "password is required" });
    }

    const userD = await UserModel.findOne({ where: { id: req.params.id } });

    if (!userD) {
      return res.status(404).json({ message: "user not found" });
    }

    const encryptedPassword = await bcrypt.hash(password.toString(), 10);
    userD.password = encryptedPassword;
    await userD.save();

    return res.status(200).json({ message: "update" });
  } catch (error) {
    console.error("updateUsersPassword:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== ELIMINAR (SOFT DELETE) ======================
export const deleteUsers = async (req, res) => {
  try {
    const user = await UserModel.findOne({ where: { id: req.params.id } });

    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }

    user.state = false;
    await user.save();

    return res.status(200).json({ message: "delete" });
  } catch (error) {
    console.error("deleteUsers:", error.message);
    return res.status(500).json({ error: error.message });
  }
};

// ====================== LOGIN ======================
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res.status(400).json({ message: "All input is required" });
    }

    const user = await UserModel.findOne({
      where: { email: email.toLowerCase() },
    });

    // Check if user exists
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Validate password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { user_id: user.id, email: user.email },
      TOKEN_KEY,
      { expiresIn: "1h" }
    );

    const dataUser = {
      id: user.id,
      user: user.user,
      email: user.email,
      typeusers_id: user.typeusers_id,
    };

    return res.status(200).json({ dataUser, token });
  } catch (err) {
    console.error("Login:", err.message);
    return res.status(500).json({ error: err.message });
  }
};

// ====================== LOGOUT (POR AHORA SIMPLE) ======================
export const logout = async (req, res) => {
  return res.status(200).json({ message: "logout" });
};

// ====================== REFRESH TOKEN (VERSIÓN SIMPLE) ======================
const jwtExpirySeconds = 3600; // 1 hora

export const refresh = (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    return res.status(401).end();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).end();
  }

  let payload;
  try {
    payload = jwt.verify(token, TOKEN_KEY);
  } catch (e) {
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).end();
    }
    return res.status(400).end();
  }

  const nowUnixSeconds = Math.round(Number(new Date()) / 1000);
  if (payload.exp - nowUnixSeconds > 30) {
    // aún le queda tiempo, no hace falta refresh
    return res.status(400).end();
  }

  const newToken = jwt.sign(
    { user_id: payload.user_id, email: payload.email },
    TOKEN_KEY,
    { expiresIn: jwtExpirySeconds }
  );

  return res.status(200).json({ token: newToken });
};
