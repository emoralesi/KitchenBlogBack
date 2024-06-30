import express from 'express';
import SSE from 'express-sse';
import { body, validationResult } from 'express-validator';
import { authMiddleware } from '../auth/Middleware.js';
import { getCategoria, saveCategoria } from '../dao/CategoriaDao.js';
import { getDificultad, saveDificultad } from '../dao/DificultadDao.js';
import { saveGrupoIngrediente } from '../dao/GrupoIngredienteDao.js';
import { getIngrediente, saveIngrediente } from '../dao/IngredienteDao.js';
import { saveItem } from '../dao/ItemDao.js';
import { getMedida, saveMedida } from '../dao/MedidaDao.js';
import { getSubCategoria, saveSubCategoria } from '../dao/SubCategoriaDao.js';
import { getUserbyId, getUserbyUsename, obtenerFavouriteByIdUser } from '../dao/UserDao.js';
import { getUtencilios, saveUtencilio } from '../dao/UtencilioDao.js';
import { guardarComment, saveUpdateReactionComment } from '../services/CommentService.js';
import { obtenerNotificationes } from '../services/NotificationService.js';
import { GetFullRecetaById, GetRecetasByIdUser, guardarReceta, saveUpdateReactionReceta } from '../services/RecetaService.js';
import { LoginUser, UserRegister, getUserDescubrir, saveUpdateFavourite } from '../services/UserService.js';

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
            return res.status(400).json({ status: 'warning', errors: errors.array() });
        }
        try {
            return UserRegister(req.body, res)
        } catch (error) {
            console.error('Error al registrar usuario:', error);
            return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar usuario' });
        }
    }
);
app.post('/login', async (req, res) => {
    try {
        return await LoginUser(req.body, res);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
    }
});

app.post('/obtenerUserAndReceta', authMiddleware, async (req, res) => {
    try {
        return await GetRecetasByIdUser(req.body, res);
    } catch (error) {
        console.error('Error al obtener usuario y Receta: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener usuario y Receta' });
    }
})

app.post('/obtenerUsuariosDescubrir', authMiddleware, async (req, res) => {
    try {
        return await getUserDescubrir(req.body, res);
    } catch (error) {
        console.error('Error al obtener usuario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener usuario y Receta' });
    }
})

app.post('/obtenerRecetaById', authMiddleware, async (req, res) => {
    try {
        return await GetFullRecetaById(req.body, res);
    } catch (error) {
        console.error('Error al iniciar sesión:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
    }
})

app.post('/saveReceta', async (req, res) => {
    try {

        return await guardarReceta(req.body, res)

    } catch (error) {
        console.error('Error al reaccionar:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
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
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al iniciar sesión' });
    }
})

app.post('/saveIngrediente', authMiddleware, async (req, res) => {
    try {
        const ingrediente = await saveIngrediente(req.body);
        res.status(200).json({ status: 'ok', data: ingrediente })
    } catch (error) {
        console.error('Error al registrar ingrediente: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar ingredientea' });
    }
})

app.post('/saveMedida', authMiddleware, async (req, res) => {
    try {
        const medida = await saveMedida(req.body);
        res.status(200).json({ status: 'ok', data: medida })
    } catch (error) {
        console.error('Error al registrar medida: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar medida' });
    }
})

app.post('/saveItem', authMiddleware, async (req, res) => {
    try {
        const Item = await saveItem(req.body);
        res.status(200).json({ status: 'ok', data: Item })
    } catch (error) {
        console.error('Error al registrar Item: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar Item' });
    }
})

app.post('/saveGrupo', authMiddleware, async (req, res) => {
    try {
        const GrupoIngrediente = await saveGrupoIngrediente(req.body);
        res.status(200).json({ status: 'ok', data: GrupoIngrediente })
    } catch (error) {
        console.error('Error al registrar Grupo de ingrediente: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar Grupo de ingrediente' });
    }
})

app.post('/saveDificultad', authMiddleware, async (req, res) => {
    try {
        const Dificultad = await saveDificultad(req.body);
        res.status(200).json({ status: 'ok', data: Dificultad })
    } catch (error) {
        console.error('Error al registrar Dificultad: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar Dificultad' });
    }
})

app.post('/saveCategoria', authMiddleware, async (req, res) => {
    try {
        const Categoria = await saveCategoria(req.body);
        res.status(200).json({ status: 'ok', data: Categoria })
    } catch (error) {
        console.error('Error al registrar Categoria: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar Categoria' });
    }
})

app.post('/saveSubCategoria', authMiddleware, async (req, res) => {
    try {
        const SubCategoria = await saveSubCategoria(req.body);
        res.status(200).json({ status: 'ok', data: SubCategoria })
    } catch (error) {
        console.error('Error al registrar Sub Categoria: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar Sub Categoria' });
    }
})

app.post('/saveUtencilio', authMiddleware, async (req, res) => {
    try {
        const Utencilio = await saveUtencilio(req.body);
        res.status(200).json({ status: 'ok', data: Utencilio })
    } catch (error) {
        console.error('Error al registrar Utencilio: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar Utencilio' });
    }
})

app.get('/obtenerSubCategorias', authMiddleware, async (req, res) => {
    try {
        const SubCategorias = await getSubCategoria();
        res.status(200).json({ status: 'ok', data: SubCategorias })
    } catch (error) {
        console.error('Error al obtener Sub categorias: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Sub categorias' });
    }
})

app.get('/obtenerUtencilios', authMiddleware, async (req, res) => {
    try {
        const Utencilios = await getUtencilios();
        res.status(200).json({ status: 'ok', data: Utencilios })
    } catch (error) {
        console.error('Error al obtener Utencilio: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Utencilios' });
    }
})

app.get('/obtenerCategorias', authMiddleware, async (req, res) => {
    try {
        const Categoria = await getCategoria();
        res.status(200).json({ status: 'ok', data: Categoria })
    } catch (error) {
        console.error('Error al obtener Categoria: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Categoria' });
    }
})

app.get('/obtenerIngredientes', authMiddleware, async (req, res) => {
    try {
        const Ingredientes = await getIngrediente();
        res.status(200).json({ status: 'ok', data: Ingredientes })
    } catch (error) {
        console.error('Error al obtener Ingredientes: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Ingredientes' });
    }
})

app.get('/obtenerMedidas', authMiddleware, async (req, res) => {
    try {
        const Medidas = await getMedida();
        res.status(200).json({ status: 'ok', data: Medidas })
    } catch (error) {
        console.error('Error al obtener Medidas: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Medidas' });
    }
})

app.get('/obtenerDificultades', authMiddleware, async (req, res) => {
    try {
        const Dificultades = await getDificultad();
        res.status(200).json({ status: 'ok', data: Dificultades })
    } catch (error) {
        console.error('Error al obtener Dificultades: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Dificultades' });
    }
})


app.post('/obtenerIdUsuarioByUserName', authMiddleware, async (req, res) => {
    try {
        const Usuario = await getUserbyUsename(req.body.username);
        res.status(200).json({ status: 'ok', userId: Usuario._id })
    } catch (error) {
        console.error('Error al obtener Dificultades: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Dificultades' });
    }
})

app.post('/obtenerIdFavourites', authMiddleware, async (req, res) => {
    try {
        const Usuario = await getUserbyId(req.body.idUser);
        res.status(200).json({ status: 'ok', favourites: Usuario.favourite })
    } catch (error) {
        console.error('Error al obtener Dificultades: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener Dificultades' });
    }
})

app.post('/saveUpdateFavourite', authMiddleware, async (req, res) => {
    try {
        await saveUpdateFavourite(req.body, res);
    } catch (error) {
        console.error('Error al guardar o remover favourite: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al guardar o remover favourite' });
    }
})

app.post('/saveUpdateRecetaReaction', authMiddleware, async (req, res) => {
    try {
        await saveUpdateReactionReceta(req.body, res);
    } catch (error) {
        console.error('Error al guardar o remover reaction: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al guardar o remover reaction' });
    }
})

app.post('/saveUpdateCommentReaction', authMiddleware, async (req, res) => {
    try {
        await saveUpdateReactionComment(req.body, res);
    } catch (error) {
        console.error('Error al guardar o remover reaction: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al guardar o remover reaction' });
    }
})

app.post('/obtenerFavourite', authMiddleware, async (req, res) => {
    try {
        const User = await obtenerFavouriteByIdUser(req.body.idUser);
        res.status(200).json({ status: 'ok', data: User })
    } catch (error) {
        console.error('Error al obtener favourite: ', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al obtener favourite' });
    }
})


export default app