import express from "express";

const app = express();
app.use(express.json());
const PORT = Number(process.env.port) || 3000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
