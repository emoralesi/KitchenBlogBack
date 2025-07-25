import {
  getUserbyEmail,
  getUserbyUsename,
  getUsersDescovery,
  saveUser,
  updateFavourite,
} from "../dao/UserDao.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { updateFavouriteReceta } from "../dao/RecetaDao.js";

export const UserRegister = async (body, res) => {
  try {
    const existingUser = await getUserbyEmail(body.email);
    const existingUserName = await getUserbyUsename(body.username);
    if (existingUser) {
      return res
        .status(400)
        .json({
          status: "warning",
          message: "El correo electrónico ya está registrado",
        });
    }

    if (existingUserName) {
      return res
        .status(400)
        .json({ status: "warning", message: "El nombre de usuario ya está registrado" });
    }
    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(body.password, 10);

    // Crear un nuevo usuario
    const usuario = {
      email: body.email.trim().toLowerCase(),
      password: hashedPassword,
      username: body.username.trim().toLowerCase(),
      favourite: [],
    };

    await saveUser(usuario);

    return res
      .status(200)
      .json({ status: "ok", message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("Error al registrar usuario:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Error interno del servidor al registrar usuario",
      });
  }
};

export const LoginUser = async (body, res) => {
  try {
    const usuario = await getUserbyEmail(body.email);

    if (!usuario) {
      return res
        .status(200)
        .json({
          status: "notOK",
          message: "El correo electrónico o la contraseña son incorrectos",
        });
    }

    // Verificar la contraseña
    const passwordMatch = await bcrypt.compare(body.password, usuario.password);

    if (!passwordMatch) {
      return res
        .status(200)
        .json({
          status: "notOK",
          message: "El correo electrónico o la contraseña son incorrectos",
        });
    }

    // Generar y devolver el token JWT
    const token = jwt.sign({ email: usuario.email }, "secreto", {
      expiresIn: "50m",
    });
    return res
      .status(200)
      .json({
        status: "ok",
        usuarioId: usuario._id,
        token: token,
        username: usuario.username,
        email: usuario.email,
        profileImageUrl: usuario.profileImageUrl,
      });
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    return res
      .status(500)
      .json({
        status: "error",
        message: "Error interno del servidor al iniciar sesión",
      });
  }
};

export const getUserDescubrir = async (body, res) => {
  const result = await getUsersDescovery(body);
  if (result.usuarios.length > 0) {
    res
      .status(200)
      .json({
        status: "ok",
        message: "Se encontraron " + result.usuarios.length + " usuarios",
        usuarios: result.usuarios,
        totalUsuarios: result.total,
      });
  } else {
    res
      .status(200)
      .json({ status: "notContent", message: "No se encontraron Recetas" });
  }
};

export const saveUpdateFavourite = async (params, res) => {
  try {
    let update;
    let updateReceta;
    console.log(params);
    if (params.estado == true) {
      // Add to favourites
      update = { $addToSet: { favourite: params.idReceta } }; // $addToSet prevents duplicates
      updateReceta = { $addToSet: { favourite: params.idUser } };
    } else if (params.estado == false) {
      // Remove from favourites
      update = { $pull: { favourite: params.idReceta } };
      updateReceta = { $pull: { favourite: params.idUser } };
    } else {
      return res
        .status(400)
        .send({
          status: "warning",
          message: "Invalid status value. Use 'true' or 'false'.",
        });
    }

    const result = await updateFavourite(params.idUser, update);
    const resultReceta = await updateFavouriteReceta(
      params.idReceta,
      updateReceta
    );

    if (!result) {
      return res
        .status(404)
        .send({ status: "warning", message: "User not found" });
    }

    if (!resultReceta) {
      return res
        .status(404)
        .send({ status: "warning", message: "Receta not found" });
    }

    res
      .status(200)
      .send({
        status: 200,
        message: "suceed",
        cantidadFavourite: result.favourite.length,
      });
  } catch (error) {
    res.status(500).send({ status: "error", message: error.message });
  }
};

export default { UserRegister, LoginUser, saveUpdateFavourite };
