import express from 'express'
import cors from 'cors'
import router from './src/routes/routes.js'
import mongoose from 'mongoose';

const app = express()
const port = 3600
app.use(cors())

app.use(express.json())
app.use(router)

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/usuarios', {
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a la base de datos MongoDB');
});

app.listen(port, () => {
    console.log('Escuchando en puerto 3600')
})