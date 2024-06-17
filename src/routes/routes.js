import express from 'express'
import { getUserbyEmail, saveUser } from '../dao/UserDao.js';
import { body, validationResult } from 'express-validator';
import { LoginUser, UserRegister, getUserDescubrir } from '../services/UserService.js';
import { GetFullPostById, GetPostsByIdUser, guardarPost } from '../services/PostService.js';
import { authMiddleware } from '../auth/Middleware.js';
import { guardarComment } from '../services/CommentService.js';
import SSE from 'express-sse';
import { obtenerNotificationes } from '../services/NotificationService.js';

const app = express();
const sse = new SSE();

const connections = new Map();

function sendSSEToUser(userId, eventData) {
    // Encuentra la conexión del usuario
    console.log("mi user id notificado", userId);
    const userConnections = connections.get(userId.toString());

    // Si el usuario tiene conexiones abiertas
    if (userConnections) {
        // Construye el evento SSE
        const sseEvent = `data: ${JSON.stringify(eventData)}\n\n`;

        // Envía el evento SSE a cada conexión del usuario
        userConnections.forEach((clientResponse) => {
            clientResponse.write(sseEvent);
        });
    } else {
        console.log(`No se encontraron conexiones abiertas para el usuario ${userId}`);
    }
}

// Middleware para manejar las conexiones SSE
app.get('/events/:userId', (req, res) => {
    const userId = req.params.userId;

    // Establece la conexión SSE
    req.socket.setTimeout(0);
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Almacena la respuesta del cliente para enviar eventos SSE
    const clientResponse = res;

    // Registra la conexión del usuario
    if (!connections.has(userId)) {
        connections.set(userId, new Set());
    }
    connections.get(userId).add(clientResponse);

    // Maneja la desconexión del cliente
    req.on('close', () => {
        console.log(`Se ha desconectado el cliente para el usuario ${userId}`);
        connections.get(userId).delete(clientResponse);
        if (connections.get(userId).size === 0) {
            connections.delete(userId);
        }
    });
});

// let clients = []

// app.get('/subscribe', (req, res) => {
//     res.setHeader('Content-Type', 'text/event-stream');
//     res.setHeader('Cache-Control', 'no-cache');
//     res.setHeader('Connection', 'keep-alive');
//     res.flushHeaders();

//     clients.push(res);

//     req.on('close', () => {
//         clients = clients.filter(client => client !== res);
//     });
// });

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
            return UserRegister(req.body, res)
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
        }
    }
);
app.post('/login', async (req, res) => {
    try {
        return await LoginUser(req.body, res);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
    }
});

app.post('/obtenerUserAndPost', authMiddleware, async (req, res) => {
    try {
        return await GetPostsByIdUser(req.body, res);
    } catch (error) {
        console.error('Error al obtener usuario y post: ', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener usuario y post' });
    }
})

app.post('/obtenerUsuariosDescubrir', authMiddleware, async (req, res) => {
    try {
        return await getUserDescubrir(req.body, res);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener usuario y post' });
    }
})

app.post('/obtenerPostById', authMiddleware, async (req, res) => {
    try {
        return await GetFullPostById(req.body, res);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
    }
})

app.post('/savePost', authMiddleware, async (req, res) => {
    try {

        return await guardarPost(req.body, res)

    } catch (error) {
        console.error('Error al reaccionar:', error);
        return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
    }
})

app.post('/saveComentario', authMiddleware, async (req, res) => {
    try {

        const result = await guardarComment(req.body, res);

        // MEJORAR LOGICA PARA DECIRIR A QUIEN ENVIAR LA NOTIFICACION
        // let eventData = {
        //     user: result.newComment.user.toString(),
        //     data: result.newComment,
        //     Notification: result.notification
        // }
        console.log(result);
        try {
            if (req.body.parentComment) {
                if (result.newComment.user.toString() !== result.ownerComment[0].user.toString()) {
                    console.log("caso 1");
                    sendSSEToUser(result.ownerComment[0].user.toString(), result);
                }

                result.userId.map((value) => {
                    if ((value !== result.ownerComment[0].user.toString()) && value !== result.newComment.user.toString()) {
                        console.log("caso 2");
                        sendSSEToUser(value, result);
                    }
                })
            } else {
                if (result.userId[0] !== result.newComment.user.toString()) {
                    console.log("caso 3");
                    sendSSEToUser(result.userId[0], result);
                }
            }
            //sse.emit(result.userId, result.notification?.action, { message: `enviando notificacion` });
        } catch (error) {
            console.error(error);
        }

        res.status(200).json({ status: 'ok', comment: result, message: 'Comentario registrado con éxito' });

    } catch (error) {
        console.error('Error al reaccionar:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
    }
})

app.post('/obtenerNotificaciones', authMiddleware, async (req, res) => {
    try {
        return await obtenerNotificationes(req.body, res);
    } catch (error) {
        console.error('Error al obtener notificaciones:', error);
        return res.status(500).json({ message: 'Error interno del servidor al iniciar sesión' });
    }
})

export default app