import express from "express";
import cors from "cors";
import router from "./src/routes/routes.js";
import mongoose from "mongoose";

const app = express();
const port = process.env.PORT || 3600;
const host = process.env.HOST || "0.0.0.0";
const mongoDB = process.env.MONGO_HOST;

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

app.use(cors());
app.use(express.json());
app.use(router);;

mongoose.connect(mongoDB, clientOptions);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Error de conexión a MongoDB:"));
db.once("open", () => {
  console.log("Conectado a la base de datos MongoDB");
});

app.listen(port, host, () => {
  console.log(`Escuchando en ${host}:${port}`);
});
