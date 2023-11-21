import express from "express";

// Ayuda a cargar las variables
// de entorno correctamente ya que daba error en los get
import dotenv from "dotenv";
dotenv.config();

// Rutas
import { authRouter } from "./routes/auth";
import { usuariosRouter } from "./routes/usuarios";
import { authProtected } from "../utils/auth";

// Inicializar aplicación
const app = express();
app.use(express.json());
const PORT = Number(process.env.port) || 3000;

// Registrar rutas
app.get("/api", (_req, res) => res.send("Hello world!"));
app.use("/api/auth", authRouter);
app.use("/api/usuarios", authProtected, usuariosRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
