// Importar dependencias
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');

// Configurar Express
const app = express();
app.use(express.json());

// Conectar a la base de datos MongoDB
mongoose.connect('mongodb://localhost:27017/usuarios', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error de conexión a MongoDB:'));
db.once('open', () => {
    console.log('Conectado a la base de datos MongoDB');
});

// Definir el esquema de Usuario
const usuarioSchema = new mongoose.Schema({
    email: { type: String, unique: true },
    password: String,
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

// Rutas de autenticación
app.post(
    '/registro',
    [
        body('email').isEmail().withMessage('El correo electrónico no es válido'),
        body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    ],
    async (req, res) => {
        // Validar los datos de entrada
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            // Verificar si el correo electrónico ya está registrado
            const existingUser = await Usuario.findOne({ email: req.body.email });
            console.log("Esto recibo de existingUser", existingUser);
            // if (existingUser) {
            //     return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
            // }

            // Hash de la contraseña
            const hashedPassword = await bcrypt.hash(req.body.password, 10);

            // Crear un nuevo usuario
            const usuario = new Usuario({
                email: req.body.email,
                password: hashedPassword,
            });

            // Guardar el usuario en la base de datos
            const newUser = await usuario.save();

            console.log("Esto es lo que recibo del new User", newUser);

            return res.status(201).json({ message: 'Usuario registrado con éxito' });
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
        }
    }
);

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Buscar el usuario por email
        const usuario = await Usuario.findOne({ email });

        if (!usuario) {
            return res.status(401).json({ message: 'El correo electrónico o la contraseña son incorrectos' });
        }

        // Verificar la contraseña
        const passwordMatch = await bcrypt.compare(password, usuario.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: 'El correo electrónico o la contraseña son incorrectos' });
        }

        // Generar y devolver el token JWT
        const token = jwt.sign({ email: usuario.email }, 'secreto', { expiresIn: '5m' });
        return res.status(200).json({ token });
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
    }
});

// Esquema de Libro
const libroSchema = new mongoose.Schema({
    titulo: String,
    autor: String,
});

const Libro = mongoose.model('Libro', libroSchema);

// Middleware de autenticación
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ message: 'Token de autenticación no proporcionado' });
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Token de autenticación inválido' });
    }

    jwt.verify(token, 'secreto', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token de autenticación inválido' });
        }
        req.user = decoded;
        next();
    });
};

// Servicios de Libros
app.post('/libros', authMiddleware, async (req, res) => {
    try {
        const libro = new Libro(req.body);
        await libro.save();
        return res.status(201).json({ message: 'Libro agregado con éxito' });
    } catch (error) {
        console.error('Error al agregar libro:', error);
        return res.status(500).json({ message: 'Error interno del servidor al agregar libro' });
    }
});

app.get('/libros', authMiddleware, async (req, res) => {
    try {
        const libros = await Libro.find();
        return res.status(200).json(libros);
    } catch (error) {
        console.error('Error al consultar libros:', error);
        return res.status(500).json({ message: 'Error interno del servidor al consultar libros' });
    }
});

app.put('/libros/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const libro = await Libro.findByIdAndUpdate(id, req.body, { new: true });
        if (!libro) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        return res.status(200).json({ message: 'Libro actualizado con éxito' });
    } catch (error) {
        console.error('Error al modificar libro:', error);
        return res.status(500).json({ message: 'Error interno del servidor al modificar libro' });
    }
});

app.delete('/libros/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const libro = await Libro.findByIdAndDelete(id);
        if (!libro) {
            return res.status(404).json({ message: 'Libro no encontrado' });
        }
        return res.status(200).json({ message: 'Libro eliminado con éxito' });
    } catch (error) {
        console.error('Error al eliminar libro:', error);
        return res.status(500).json({ message: 'Error interno del servidor al eliminar libro' });
    }
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor en ejecución en el puerto ${PORT}`);
});