import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";

dotenv.config();

// Rutas
import { authRouter } from "./routes/auth";
import { condominioRouter } from "./routes/condominios";
import { usuariosRouter } from "./routes/usuarios";
import { authProtected } from "../utils/auth";
import { gastosRouter } from "./routes/gastos";
import { reportesRouter } from "./routes/reportes";
import { anunciosRouter } from "./routes/anuncios";

// Inicializar aplicación
const app = express();
app.use(express.json());
app.use(cors());
if (__dirname.endsWith("build/src") || __dirname.endsWith("build\\src")) {
    // PROD
    app.use("/public", express.static(path.join(__dirname, "../../public")));
} else {
    // DEV
    app.use("/public", express.static(path.join(__dirname, "../public")));
}
const PORT = Number(process.env.PORT) || 3000;

// Registrar rutas
app.get("/api", (_req, res) => res.send("Hello world!"));
app.use("/api/auth", authRouter);
app.use("/api/condominios", authProtected, condominioRouter);
app.use("/api/usuarios", authProtected, usuariosRouter);
app.use("/api/gastos", authProtected, gastosRouter);
app.use("/api/reportes", authProtected, reportesRouter);
app.use("/api/anuncios", authProtected, anunciosRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
