import express from "express";
import { authRouter } from "./routes/auth";

// Inicializar aplicación
const app = express();
app.use(express.json());
const PORT = Number(process.env.port) || 3000;

// Registrar rutas
app.get("/api", (_req, res) => res.send("Hello world!"));
app.use("/api/auth", authRouter);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
