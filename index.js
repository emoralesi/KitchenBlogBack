import express from 'express'
import cors from 'cors'
import router from './src/routes/routes.js'
import mongoose from 'mongoose';

const app = express()
const port = 3600
app.use(cors())

app.use(express.json())
app.use(router)

const mongoDB = process.env.DEV_MONGO_HOST || 'mongodb://localhost:27017/usuarios'
const host = process.env.DEV_HOST || 'localhost'

// Conectar a la base de datos MongoDB
mongoose.connect(mongoDB, {
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a la base de datos MongoDB');
});

app.listen(port, host, () => {
    console.log(`Escuchando en ${host}:${port}`)
})