import express from "express";

// Ayuda a cargar las variables
// de entorno correctamente ya que daba error en los get
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

// Rutas
import { authRouter } from "./routes/auth";
import { condominioRouter } from "./routes/condominio";
import { usuariosRouter } from "./routes/usuarios";
import { authProtected } from "../utils/auth";
import { gastosRouter } from "./routes/gastos";
import { reportesRouter } from "./routes/reportes";

// Inicializar aplicación
const app = express();
app.use(express.json());
app.use(cors());
const PORT = Number(process.env.PORT) || 3000;

// Registrar rutas
app.get("/api", (_req, res) => res.send("Hello world!"));
app.use("/api/auth", authRouter);
// Poner el authProtected kakkaka
app.use("/api/condominios", condominioRouter);
app.use("/api/usuarios", authProtected, usuariosRouter);
app.use("/api/gastos", authProtected, gastosRouter);
app.use("/api/reportes", authProtected, reportesRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
