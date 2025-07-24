import pkg from "cloudinary";
import express from "express";
import SSE from "express-sse";
import { body, validationResult } from "express-validator";
import { authMiddleware } from "../auth/Middleware.js";
import { getCategoria, saveCategoria } from "../dao/CategoriaDao.js";
import { savePresentacion, getPresentacion } from "../dao/PresentacionDao.js";
import { getDificultad, saveDificultad } from "../dao/DificultadDao.js";
import { saveGrupoIngrediente } from "../dao/GrupoIngredienteDao.js";
import { getIngrediente, saveIngrediente } from "../dao/IngredienteDao.js";
import { saveItem } from "../dao/ItemDao.js";
import { getMedida, saveMedida } from "../dao/MedidaDao.js";
import {
  actualizarPined,
  desactivateRecipe,
  getRecetasInfo,
  obtenerShopping,
} from "../dao/RecetaDao.js";
import { getSubCategoria, saveSubCategoria } from "../dao/SubCategoriaDao.js";
import {
  getUserbyId,
  getUserbyUsename,
  obtenerDatosRecAndFav,
  obtenerFavouriteByIdUser,
} from "../dao/UserDao.js";
import { getUtencilios, saveUtencilio } from "../dao/UtencilioDao.js";
import Usuario from "../models/usuarioModel.js";
import {
  guardarComment,
  saveUpdateReactionComment,
} from "../services/CommentService.js";
import {
  obtenerNotificationes,
  readedActionNotification,
} from "../services/NotificationService.js";
import {
  actualizarReceta,
  GetFullRecetaById,
  GetRecetasByIdUser,
  guardarReceta,
  saveUpdateReactionReceta,
} from "../services/RecetaService.js";
import {
  getUserDescubrir,
  LoginUser,
  saveUpdateFavourite,
  UserRegister,
} from "../services/UserService.js";
import { sendEmail } from "../utils/sendEmail.js";
import multer from "multer";

const app = express();
const sse = new SSE();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Carpeta donde se guardarán los archivos
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const connections = new Map();
const { v2: cloudinary } = pkg;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export function sendSSEToUser(userId, eventData) {
  const userConnections = connections.get(userId.toString());

  if (userConnections) {
    const sseEvent = `data: ${JSON.stringify(eventData)}\n\n`;

    userConnections.forEach((clientResponse) => {
      clientResponse.write(sseEvent);
    });
  } else {
    console.log(
      `No se encontraron conexiones abiertas para el usuario ${userId}`
    );
  }
}

// Middleware para manejar las conexiones SSE
app.get("/events/:userId", (req, res) => {
  const userId = req.params.userId;

  // Establece la conexión SSE
  req.socket.setTimeout(0);
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // Almacena la respuesta del cliente para enviar eventos SSE
  const clientResponse = res;

  // Registra la conexión del usuario
  if (!connections.has(userId)) {
    connections.set(userId, new Set());
  }
  connections.get(userId).add(clientResponse);

  // Maneja la desconexión del cliente
  req.on("close", () => {
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
  "/registro",
  [
    body("email").isEmail().withMessage("El correo electrónico no es válido"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("La contraseña debe tener al menos 6 caracteres"),
  ],
  async (req, res) => {
    // Validar los datos de entrada
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res
        .status(400)
        .json({ status: "warning", errors: errors.array() });
    }
    try {
      return UserRegister(req.body, res);
    } catch (error) {
      console.error("Error al registrar usuario:", error);
      return res.status(500).json({
        status: "error",
        message: "Error interno del servidor al registrar usuario",
      });
    }
  }
);
app.post("/login", async (req, res) => {
  try {
    return await LoginUser(req.body, res);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

app.post("/obtenerUserAndReceta", authMiddleware, async (req, res) => {
  try {
    return await GetRecetasByIdUser(req.body, res);
  } catch (error) {
    console.error("Error al obtener usuario y Receta: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener usuario y Receta",
    });
  }
});

app.post("/obtenerUsuariosDescubrir", authMiddleware, async (req, res) => {
  try {
    return await getUserDescubrir(req.body, res);
  } catch (error) {
    console.error("Error al obtener usuario:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener usuario y Receta",
    });
  }
});

app.post("/obtenerRecetaById", authMiddleware, async (req, res) => {
  try {
    return await GetFullRecetaById(req.body, res);
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

app.post(
  "/saveReceta",
  authMiddleware,
  upload.fields([
    { name: "recipeImages", maxCount: 10 },
    { name: "stepsImages", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      const recipeImages = req.files["recipeImages"];
      const stepsImages = req.files["stepsImages"];
      const receta = JSON.parse(req.body.receta);

      return await guardarReceta(
        receta,
        res,
        recipeImages,
        stepsImages,
        cloudinary
      );
    } catch (error) {
      console.error("Error al reaccionar:", error);
      return res.status(500).json({
        status: "error",
        message: "Error interno del servidor al iniciar sesión",
      });
    }
  }
);

app.post(
  "/updateReceta",
  authMiddleware,
  upload.fields([{ name: "recipeImages", maxCount: 10 }]),
  async (req, res) => {
    try {
      const recipeImages = req.files["recipeImages"];
      const receta = JSON.parse(req.body.receta);

      return await actualizarReceta(receta, recipeImages, res, cloudinary);
    } catch (error) {
      console.error("Error al updateReceta:", error);
      return res.status(500).json({
        status: "error",
        message: "Error interno del servidor al iniciar sesión",
      });
    }
  }
);

app.post("/updatePined", authMiddleware, async (req, res) => {
  try {
    const data = await actualizarPined(req.body, res);
    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    console.error("Error al updateReceta:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

app.post("/saveComentario", authMiddleware, async (req, res) => {
  try {
    const result = await guardarComment(req.body, res);
    sendSSEToUser;

    res.status(200).json({
      status: "ok",
      comment: result.comment,
      message: "Comentario registrado con éxito",
    });
  } catch (error) {
    console.error("Error al reaccionar:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

app.post("/obtenerNotificaciones", authMiddleware, async (req, res) => {
  try {
    return await obtenerNotificationes(req.body, res);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

app.post("/readedNotification", authMiddleware, async (req, res) => {
  try {
    return await readedActionNotification(req.body, res);
  } catch (error) {
    console.error("Error al obtener notificaciones:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al iniciar sesión",
    });
  }
});

app.post("/saveIngrediente", authMiddleware, async (req, res) => {
  try {
    const ingrediente = await saveIngrediente(req.body);
    res.status(200).json({ status: "ok", data: ingrediente });
  } catch (error) {
    console.error("Error al registrar ingrediente: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar ingredientea",
    });
  }
});

app.post("/saveMedida", authMiddleware, async (req, res) => {
  try {
    const medida = await saveMedida(req.body);
    res.status(200).json({ status: "ok", data: medida });
  } catch (error) {
    console.error("Error al registrar medida: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar medida",
    });
  }
});

app.post("/saveItem", authMiddleware, async (req, res) => {
  try {
    const Item = await saveItem(req.body);
    res.status(200).json({ status: "ok", data: Item });
  } catch (error) {
    console.error("Error al registrar Item: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Item",
    });
  }
});

app.post("/saveGrupo", authMiddleware, async (req, res) => {
  try {
    const GrupoIngrediente = await saveGrupoIngrediente(req.body);
    res.status(200).json({ status: "ok", data: GrupoIngrediente });
  } catch (error) {
    console.error("Error al registrar Grupo de ingrediente: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Grupo de ingrediente",
    });
  }
});

app.post("/saveDificultad", authMiddleware, async (req, res) => {
  try {
    const Dificultad = await saveDificultad(req.body);
    res.status(200).json({ status: "ok", data: Dificultad });
  } catch (error) {
    console.error("Error al registrar Dificultad: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Dificultad",
    });
  }
});

app.post("/saveCategoria", authMiddleware, async (req, res) => {
  try {
    const Categoria = await saveCategoria(req.body);
    res.status(200).json({ status: "ok", data: Categoria });
  } catch (error) {
    console.error("Error al registrar Categoria: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Categoria",
    });
  }
});

app.post("/savePresentacion", authMiddleware, async (req, res) => {
  try {
    const presentacion = await savePresentacion(req.body);
    res.status(200).json({ status: "ok", data: presentacion });
  } catch (error) {
    console.error("Error al registrar presentacion: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar presentacion",
    });
  }
});

app.post("/saveSubCategoria", authMiddleware, async (req, res) => {
  try {
    const SubCategoria = await saveSubCategoria(req.body);
    res.status(200).json({ status: "ok", data: SubCategoria });
  } catch (error) {
    console.error("Error al registrar Sub Categoria: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Sub Categoria",
    });
  }
});

app.post("/saveUtencilio", authMiddleware, async (req, res) => {
  try {
    const Utencilio = await saveUtencilio(req.body);
    res.status(200).json({ status: "ok", data: Utencilio });
  } catch (error) {
    console.error("Error al registrar Utencilio: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Utencilio",
    });
  }
});

app.get("/obtenerSubCategorias", authMiddleware, async (req, res) => {
  try {
    const SubCategorias = await getSubCategoria();
    res.status(200).json({ status: "ok", data: SubCategorias });
  } catch (error) {
    console.error("Error al obtener Sub categorias: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Sub categorias",
    });
  }
});

app.get("/obtenerUtencilios", authMiddleware, async (req, res) => {
  try {
    const Utencilios = await getUtencilios();
    res.status(200).json({ status: "ok", data: Utencilios });
  } catch (error) {
    console.error("Error al obtener Utencilio: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Utencilios",
    });
  }
});

app.get("/obtenerCategorias", authMiddleware, async (req, res) => {
  try {
    const Categoria = await getCategoria();
    res.status(200).json({ status: "ok", data: Categoria });
  } catch (error) {
    console.error("Error al obtener Categoria: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Categoria",
    });
  }
});

app.get("/obtenerPresentaciones", authMiddleware, async (req, res) => {
  try {
    const Presentacion = await getPresentacion();
    res.status(200).json({ status: "ok", data: Presentacion });
  } catch (error) {
    console.error("Error al obtener Presentacion: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Presentacion",
    });
  }
});

app.get("/obtenerIngredientes", authMiddleware, async (req, res) => {
  try {
    const Ingredientes = await getIngrediente();
    res.status(200).json({ status: "ok", data: Ingredientes });
  } catch (error) {
    console.error("Error al obtener Ingredientes: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Ingredientes",
    });
  }
});

app.get("/obtenerMedidas", authMiddleware, async (req, res) => {
  try {
    const Medidas = await getMedida();
    res.status(200).json({ status: "ok", data: Medidas });
  } catch (error) {
    console.error("Error al obtener Medidas: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Medidas",
    });
  }
});

app.get("/obtenerDificultades", authMiddleware, async (req, res) => {
  try {
    const Dificultades = await getDificultad();
    res.status(200).json({ status: "ok", data: Dificultades });
  } catch (error) {
    console.error("Error al obtener Dificultades: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Dificultades",
    });
  }
});

app.post("/obtenerIdUsuarioByUserName", authMiddleware, async (req, res) => {
  try {
    const Usuario = await getUserbyUsename(req.body.username);
    res.status(200).json({ status: "ok", userId: Usuario._id, user: Usuario });
  } catch (error) {
    console.error("Error al obtener Dificultades: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Dificultades",
    });
  }
});

app.post("/obtenerIdFavourites", authMiddleware, async (req, res) => {
  try {
    const Usuario = await getUserbyId(req.body.idUser);
    res.status(200).json({ status: "ok", favourites: Usuario.favourite });
  } catch (error) {
    console.error("Error al obtener Dificultades: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener Dificultades",
    });
  }
});

app.post("/saveUpdateFavourite", authMiddleware, async (req, res) => {
  try {
    await saveUpdateFavourite(req.body, res);
  } catch (error) {
    console.error("Error al guardar o remover favourite: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al guardar o remover favourite",
    });
  }
});

app.post("/saveUpdateRecetaReaction", authMiddleware, async (req, res) => {
  try {
    await saveUpdateReactionReceta(req.body, res);
  } catch (error) {
    console.error("Error al guardar o remover reaction: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al guardar o remover reaction",
    });
  }
});

app.post("/saveUpdateCommentReaction", authMiddleware, async (req, res) => {
  try {
    await saveUpdateReactionComment(req.body, res);
  } catch (error) {
    console.error("Error al guardar o remover reaction: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al guardar o remover reaction",
    });
  }
});

app.post("/desactivarReceta", authMiddleware, async (req, res) => {
  try {
    const result = await desactivateRecipe(req.body.recetaId, res);
    res.status(200).json({ status: "ok", data: result });
  } catch (error) {
    console.error("Error al guardar o remover reaction: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al guardar o remover reaction",
    });
  }
});

app.post("/obtenerFavourite", authMiddleware, async (req, res) => {
  try {
    const User = await obtenerFavouriteByIdUser(
      req.body.idUser,
      req.body.page,
      req.body.limit
    );
    if (User[0]?.favourite?.length > 0) {
      res.status(200).json({
        status: "ok",
        message: "Se encontraron " + User[0].favourite.length + " Recetas",
        Favourites: User[0].favourite,
        totalFavourite: User[0].totalFavourite,
      });
    } else {
      res.status(200).json({
        status: "notContent",
        message: "No se encontraron Recetas",
        Favourites: [],
      });
    }
  } catch (error) {
    console.error("Error al obtener favourite: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener favourite",
    });
  }
});

app.post("/obtenerRecetasinfo", authMiddleware, async (req, res) => {
  try {
    const Recetas = await getRecetasInfo(
      req.body.page,
      req.body.limit,
      req.body.filter,
      req.body.orderBy
    );

    if (Recetas.recetas?.length > 0) {
      res.status(200).json({
        status: "ok",
        message: "Se encontraron " + Recetas.recetas.length + " Recetas",
        Recetas: Recetas.recetas,
        totalRecetas: Recetas.total,
      });
    } else {
      res.status(200).json({
        status: "notContent",
        message: "No se encontraron Recetas",
        Recetas: [],
      });
    }
  } catch (error) {
    console.error("Error al obtener favourite: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener recetas info",
    });
  }
});

app.post("/obtenerDataUsuario", authMiddleware, async (req, res) => {
  try {
    const User = await obtenerDatosRecAndFav(req.body.idUser);
    res.status(200).json({ status: "ok", data: User });
  } catch (error) {
    console.error("Error al obtener favourite: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener favourite",
    });
  }
});

app.post("/obtenerShopping", authMiddleware, async (req, res) => {
  try {
    const Shopping = await obtenerShopping(req.body.idRecetas);

    res.status(200).json({ status: "ok", data: Shopping });
  } catch (error) {
    console.error("Error al obtener shopping: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener shopping",
    });
  }
});

app.post("/sendEmailShopping", async (req, res) => {
  try {
    const data = await sendEmail();
    res.status(200).json({ status: "ok", data: data });
  } catch (error) {
    console.error("Error al obtener shopping: ", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al obtener shopping",
    });
  }
});

app.post(
  "/upload-profile-image",
  authMiddleware,
  upload.single("profileImage"),
  async (req, res) => {
    try {
      const optimizedUrl = await cloudinary.uploader.upload(req.file.path, {
        folder: "Profiles_images",
        format: "webp",
        fetch_format: "auto",
        quality: "auto",
        width: 1600,
        crop: "limit",
      });

      const user = await Usuario.findById(req.body.idUsuario);

      user.profileImageUrl = optimizedUrl.public_id; // Guarda la URL de la imagen en la base de datos
      await user.save();

      res.json({
        message: "Imagen de perfil actualizada correctamente",
        imageUrl: optimizedUrl.public_id,
      });
    } catch (error) {
      console.log(error);

      res
        .status(500)
        .json({ message: "Error al actualizar la imagen de perfil", error });
    }
  }
);

export default app;
