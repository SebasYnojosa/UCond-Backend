import express from "express";

// Ayuda a cargar las variables
// de entorno correctamente ya que daba error en los get
import dotenv from "dotenv";
dotenv.config();

// Rutas
import { authRouter } from "./routes/auth";
import { condominioRouter } from "./routes/condominio";
import { usuariosRouter } from "./routes/usuarios";
import { authProtected } from "../utils/auth";
import { gastosRouter } from "./routes/gastos";

// Inicializar aplicación
const app = express();
app.use(express.json());
const PORT = Number(process.env.port) || 3000;

// Registrar rutas
app.get("/api", (_req, res) => res.send("Hello world!"));
app.use("/api/auth", authRouter);
app.use("/api/condominios", authProtected, condominioRouter);
app.use("/api/usuarios", authProtected, usuariosRouter);
app.use("/api/gastos", authProtected, gastosRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
