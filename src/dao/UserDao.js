import Usuario from "../models/usuarioModel.js";
import { ObjectId } from "mongodb";

export const getUserbyEmail = async (emailUser) => {
  try {
    return await Usuario.findOne({ email: emailUser.toLowerCase() });
  } catch (error) {
    throw error;
  }
};

export const getUserbyId = async (idUser) => {
  try {
    return await Usuario.findOne({ _id: idUser });
  } catch (error) {
    throw error;
  }
};

export const getUserbyUsename = async (userName) => {
  console.log("mi userName", userName);
  try {
    return await Usuario.findOne(
      { username: userName.toLowerCase() },
      { username: 1, email: 1, _id: 1, profileImageUrl: 1 }
    );
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const obtenerFavouriteByIdUser = async (idUser, page, limit) => {
  console.log("mi idUser desde dao", idUser);
  const userId = new ObjectId(idUser);
  const skip = (page - 1) * limit;

  try {
    return await Usuario.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "recetas",
          localField: "favourite",
          foreignField: "_id",
          as: "favourite",
        },
      },
      {
        $unwind: {
          path: "$favourite",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: {
          "favourite.active": true,
        },
      },
      {
        $lookup: {
          from: "dificultads",
          localField: "favourite.dificultad",
          foreignField: "_id",
          as: "favourite.dificultad",
        },
      },
      {
        $lookup: {
          from: "usuarios",
          let: {
            userId: "$favourite.user",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$_id", "$$userId"],
                },
              },
            },
            {
              $project: {
                _id: 1,
                username: 1,
                profileImageUrl: 1,
              },
            },
          ],
          as: "favourite.user",
        },
      },
      {
        $lookup: {
          from: "categorias",
          localField: "favourite.categoria",
          foreignField: "_id",
          as: "favourite.categoria",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "favourite._id",
          foreignField: "receta",
          as: "favourite.comments",
        },
      },
      {
        $unwind: {
          path: "$favourite.subCategoria",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subcategorias",
          localField: "favourite.subCategoria",
          foreignField: "_id",
          as: "favourite.subCategoria",
        },
      },
      {
        $addFields: {
          "favourite.subCategoria": {
            $cond: {
              if: {
                $isArray: "$favourite.subCategoria",
              },
              then: {
                $arrayElemAt: ["$favourite.subCategoria", 0],
              },
              else: "$favourite.subCategoria",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            favouriteId: "$favourite._id",
            userId: "$_id",
          },
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          titulo: {
            $first: "$favourite.titulo",
          },
          descripcion: {
            $first: "$favourite.descripcion",
          },
          images: {
            $first: "$favourite.images",
          },
          reactions: {
            $first: "$favourite.reactions",
          },
          hours: {
            $first: "$favourite.hours",
          },
          minutes: {
            $first: "$favourite.minutes",
          },
          grupoIngrediente: {
            $first: "$favourite.grupoIngrediente",
          },
          cantidadPersonas: {
            $first: "$favourite.cantidadPersonas",
          },
          dificultad: {
            $first: "$favourite.dificultad",
          },
          categoria: {
            $first: "$favourite.categoria",
          },
          comments: {
            $first: "$favourite.comments",
          },
          favourite: {
            $first: "$favourite.favourite",
          },
          pined: {
            $first: "$favourite.pined",
          },
          user: {
            $first: "$favourite.user",
          },
          active: {
            $first: "$favourite.active",
          },
          fechaReceta: {
            $first: "$favourite.fechaReceta",
          },
          subCategoria: {
            $addToSet: "$favourite.subCategoria",
          },
        },
      },
      {
        $lookup: {
          from: "grupoingredientes",
          localField: "grupoIngrediente",
          foreignField: "_id",
          as: "grupoIngrediente",
        },
      },
      {
        $unwind: "$grupoIngrediente",
      },
      {
        $unwind: "$grupoIngrediente.item",
      },
      {
        $lookup: {
          from: "items",
          localField: "grupoIngrediente.item",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: "$item",
      },
      {
        $unwind: {
          path: "$item.alternativas",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ingredientes",
          localField: "item.alternativas.ingrediente",
          foreignField: "_id",
          as: "item.alternativas.ingrediente",
        },
      },
      {
        $unwind: {
          path: "$item.alternativas.ingrediente",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            itemId: "$item._id",
            docId: "$_id",
          },
          root: {
            $first: "$$ROOT",
          },
          alternativas: {
            $push: "$item.alternativas.ingrediente",
          },
        },
      },
      {
        $addFields: {
          "root.item.alternativas": "$alternativas",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$root",
        },
      },
      {
        $lookup: {
          from: "medidas",
          localField: "item.medida",
          foreignField: "_id",
          as: "item.medida",
        },
      },
      {
        $unwind: "$item.medida",
      },
      {
        $lookup: {
          from: "presentacions",
          localField: "item.presentacion",
          foreignField: "_id",
          as: "item.presentacion",
        },
      },
      {
        $unwind: {
          path: "$item.presentacion",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ingredientes",
          localField: "item.ingrediente",
          foreignField: "_id",
          as: "item.ingrediente",
        },
      },
      {
        $unwind: "$item.ingrediente",
      },
      {
        $group: {
          _id: {
            grupoIngrediente_id: "$grupoIngrediente._id",
            grupoIngrediente_nombreGrupo: "$grupoIngrediente.nombreGrupo",
            _id: "$_id",
          },
          grupoIngrediente_id: {
            $first: "$grupoIngrediente._id",
          },
          grupoIngrediente_nombreGrupo: {
            $first: "$grupoIngrediente.nombreGrupo",
          },
          items: {
            $push: {
              _id: "$item._id",
              medida: "$item.medida",
              ingrediente: "$item.ingrediente",
              valor: "$item.valor",
              presentacion: "$item.presentacion",
              alternativas: "$item.alternativas",
            },
          },
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          titulo: {
            $first: "$titulo",
          },
          descripcion: {
            $first: "$descripcion",
          },
          images: {
            $first: "$images",
          },
          reactions: {
            $first: "$reactions",
          },
          hours: {
            $first: "$hours",
          },
          minutes: {
            $first: "$minutes",
          },
          cantidadPersonas: {
            $first: "$cantidadPersonas",
          },
          dificultad: {
            $first: "$dificultad",
          },
          categoria: {
            $first: "$categoria",
          },
          utencilio: {
            $first: "$utencilio",
          },
          subCategoria: {
            $first: "$subCategoria",
          },
          user: {
            $first: "$user",
          },
          reactions: {
            $first: "$reactions",
          },
          pasos: {
            $first: "$pasos",
          },
          favourite: {
            $first: "$favourite",
          },
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
          pined: {
            $first: "$pined",
          },
          active: {
            $first: "$active",
          },
        },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "reactions",
          foreignField: "_id",
          as: "reactions",
        },
      },
      {
        $group: {
          _id: "$_id._id",
          titulo: {
            $first: "$titulo",
          },
          descripcion: {
            $first: "$descripcion",
          },
          images: {
            $first: "$images",
          },
          hours: {
            $first: "$hours",
          },
          minutes: {
            $first: "$minutes",
          },
          cantidadPersonas: {
            $first: "$cantidadPersonas",
          },
          dificultad: {
            $first: "$dificultad",
          },
          categoria: {
            $first: "$categoria",
          },
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          grupoIngrediente: {
            $push: {
              _id: "$grupoIngrediente_id",
              nombreGrupo: "$_id.grupoIngrediente_nombreGrupo",
              item: "$items",
            },
          },
          utencilio: {
            $first: "$utencilio",
          },
          subCategoria: {
            $first: "$subCategoria",
          },
          user: {
            $first: "$user",
          },
          reactions: {
            $first: "$reactions",
          },
          pasos: {
            $first: "$pasos",
          },
          favourite: {
            $first: "$favourite",
          },
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
          reactions: {
            $first: "$reactions",
          },
          pined: {
            $first: "$pined",
          },
          user: {
            $first: "$user",
          },
          active: {
            $first: "$active",
          },
        },
      },
      {
        $sort: {
          fechaReceta: -1,
        },
      },
      {
        $group: {
          _id: "$_id.userId",
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          favourite: {
            $push: {
              _id: "$_id.favouriteId",
              titulo: "$titulo",
              descripcion: "$descripcion",
              images: "$images",
              hours: "$hours",
              minutes: "$minutes",
              grupoIngrediente: "$grupoIngrediente",
              cantidadPersonas: "$cantidadPersonas",
              dificultad: "$dificultad",
              categoria: "$categoria",
              subCategoria: "$subCategoria",
              comments: "$comments",
              reactions: "$reactions",
              user: "$user",
              pined: "$pined",
              active: "$active",
              fechaReceta: "$fechaReceta",
              favourite: "$favourite",
            },
          },
          totalFavourite: {
            $sum: 1,
          },
        },
      },
      {
        $addFields: {
          favourite: {
            $slice: ["$favourite", skip, limit],
          },
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

export const obtenerDatosRecAndFav = async (idUser) => {
  console.log("mi idUser desde dao", idUser);
  const userId = new ObjectId(idUser);
  try {
    return await Usuario.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $addFields: {
          isFavouriteEmpty: {
            $cond: {
              if: {
                $eq: ["$favourite", []],
              },
              then: true,
              else: false,
            },
          },
        },
      },
      {
        $lookup: {
          from: "recetas",
          let: { favouriteIds: "$favourite" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $in: ["$_id", "$$favouriteIds"] },
                    { $eq: ["$active", true] },
                  ],
                },
              },
            },
          ],
          as: "favourite",
        },
      },
      {
        $addFields: {
          favouriteCount: {
            $size: "$favourite",
          },
        },
      },
      {
        $lookup: {
          from: "recetas",
          let: { userId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user", "$$userId"] },
                    { $eq: ["$active", true] },
                  ],
                },
              },
            },
          ],
          as: "recetas",
        },
      },
      {
        $addFields: {
          recetaCount: {
            $size: "$recetas",
          },
        },
      },
      {
        $project: {
          favouriteCount: 1,
          recetaCount: 1,
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

export const saveUser = async (user) => {
  try {
    const usuario = new Usuario(user);
    return await usuario.save();
  } catch (error) {
    throw error;
  }
};

export const obtenerRecetaByIdUser = async (idUser, page, limit) => {
  const userId = new ObjectId(idUser);
  const skip = (page - 1) * limit;

  try {
    return await Usuario.aggregate([
      {
        $match: {
          _id: userId,
        },
      },
      {
        $lookup: {
          from: "recetas",
          localField: "_id",
          foreignField: "user",
          as: "recetas",
        },
      },
      {
        $addFields: {
          recetas: {
            $filter: {
              input: "$recetas",
              as: "receta",
              cond: {
                $eq: ["$$receta.active", true],
              },
            },
          },
        },
      },
      {
        $unwind: "$recetas",
      },
      {
        $lookup: {
          from: "dificultads",
          localField: "recetas.dificultad",
          foreignField: "_id",
          as: "recetas.dificultad",
        },
      },
      {
        $lookup: {
          from: "categorias",
          localField: "recetas.categoria",
          foreignField: "_id",
          as: "recetas.categoria",
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "recetas._id",
          foreignField: "receta",
          as: "recetas.comments",
        },
      },
      {
        $unwind: {
          path: "$recetas.subCategoria",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "subcategorias",
          localField: "recetas.subCategoria",
          foreignField: "_id",
          as: "recetas.subCategoria",
        },
      },
      {
        $addFields: {
          "recetas.subCategoria": {
            $cond: {
              if: {
                $isArray: "$recetas.subCategoria",
              },
              then: {
                $arrayElemAt: ["$recetas.subCategoria", 0],
              },
              else: "$recetas.subCategoria",
            },
          },
        },
      },
      {
        $group: {
          _id: {
            recetaId: "$recetas._id",
            userId: "$_id",
          },
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          titulo: {
            $first: "$recetas.titulo",
          },
          descripcion: {
            $first: "$recetas.descripcion",
          },
          images: {
            $first: "$recetas.images",
          },
          reactions: {
            $first: "$recetas.reactions",
          },
          hours: {
            $first: "$recetas.hours",
          },
          minutes: {
            $first: "$recetas.minutes",
          },
          grupoIngrediente: {
            $first: "$recetas.grupoIngrediente",
          },
          cantidadPersonas: {
            $first: "$recetas.cantidadPersonas",
          },
          dificultad: {
            $first: "$recetas.dificultad",
          },
          categoria: {
            $first: "$recetas.categoria",
          },
          comments: {
            $first: "$recetas.comments",
          },
          favourite: {
            $first: "$recetas.favourite",
          },
          pined: {
            $first: "$recetas.pined",
          },
          active: {
            $first: "$recetas.active",
          },
          fechaReceta: {
            $first: "$recetas.fechaReceta",
          },
          subCategoria: {
            $addToSet: "$recetas.subCategoria",
          },
        },
      },
      {
        $lookup: {
          from: "grupoingredientes",
          localField: "grupoIngrediente",
          foreignField: "_id",
          as: "grupoIngrediente",
        },
      },
      {
        $unwind: "$grupoIngrediente",
      },
      {
        $unwind: "$grupoIngrediente.item",
      },
      {
        $lookup: {
          from: "items",
          localField: "grupoIngrediente.item",
          foreignField: "_id",
          as: "item",
        },
      },
      {
        $unwind: "$item",
      },
      {
        $unwind: {
          path: "$item.alternativas",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ingredientes",
          localField: "item.alternativas.ingrediente",
          foreignField: "_id",
          as: "item.alternativas.ingrediente",
        },
      },
      {
        $unwind: {
          path: "$item.alternativas.ingrediente",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            itemId: "$item._id",
            docId: "$_id",
          },
          root: {
            $first: "$$ROOT",
          },
          alternativas: {
            $push: "$item.alternativas.ingrediente",
          },
        },
      },
      {
        $addFields: {
          "root.item.alternativas": "$alternativas",
        },
      },
      {
        $replaceRoot: {
          newRoot: "$root",
        },
      },
      {
        $lookup: {
          from: "medidas",
          localField: "item.medida",
          foreignField: "_id",
          as: "item.medida",
        },
      },
      {
        $unwind: "$item.medida",
      },
      {
        $lookup: {
          from: "presentacions",
          localField: "item.presentacion",
          foreignField: "_id",
          as: "item.presentacion",
        },
      },
      {
        $unwind: {
          path: "$item.presentacion",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "ingredientes",
          localField: "item.ingrediente",
          foreignField: "_id",
          as: "item.ingrediente",
        },
      },
      {
        $unwind: "$item.ingrediente",
      },
      {
        $group: {
          _id: {
            grupoIngrediente_id: "$grupoIngrediente._id",
            grupoIngrediente_nombreGrupo: "$grupoIngrediente.nombreGrupo",
            _id: "$_id",
          },
          grupoIngrediente_id: {
            $first: "$grupoIngrediente._id",
          },
          grupoIngrediente_nombreGrupo: {
            $first: "$grupoIngrediente.nombreGrupo",
          },
          items: {
            $push: {
              _id: "$item._id",
              medida: "$item.medida",
              ingrediente: "$item.ingrediente",
              valor: "$item.valor",
              presentacion: "$item.presentacion",
              alternativas: "$item.alternativas",
            },
          },
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          titulo: {
            $first: "$titulo",
          },
          descripcion: {
            $first: "$descripcion",
          },
          images: {
            $first: "$images",
          },
          reactions: {
            $first: "$reactions",
          },
          hours: {
            $first: "$hours",
          },
          minutes: {
            $first: "$minutes",
          },
          cantidadPersonas: {
            $first: "$cantidadPersonas",
          },
          dificultad: {
            $first: "$dificultad",
          },
          categoria: {
            $first: "$categoria",
          },
          utencilio: {
            $first: "$utencilio",
          },
          subCategoria: {
            $first: "$subCategoria",
          },
          user: {
            $first: "$user",
          },
          reactions: {
            $first: "$reactions",
          },
          pasos: {
            $first: "$pasos",
          },
          favourite: {
            $first: "$favourite",
          },
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
          pined: {
            $first: "$pined",
          },
          active: {
            $first: "$active",
          },
        },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "reactions",
          foreignField: "_id",
          as: "reactions",
        },
      },
      {
        $group: {
          _id: "$_id._id",
          titulo: {
            $first: "$titulo",
          },
          descripcion: {
            $first: "$descripcion",
          },
          images: {
            $first: "$images",
          },
          hours: {
            $first: "$hours",
          },
          minutes: {
            $first: "$minutes",
          },
          cantidadPersonas: {
            $first: "$cantidadPersonas",
          },
          dificultad: {
            $first: "$dificultad",
          },
          categoria: {
            $first: "$categoria",
          },
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          grupoIngrediente: {
            $push: {
              _id: "$grupoIngrediente_id",
              nombreGrupo: "$_id.grupoIngrediente_nombreGrupo",
              item: "$items",
            },
          },
          utencilio: {
            $first: "$utencilio",
          },
          subCategoria: {
            $first: "$subCategoria",
          },
          user: {
            $first: "$user",
          },
          reactions: {
            $first: "$reactions",
          },
          pasos: {
            $first: "$pasos",
          },
          favourite: {
            $first: "$favourite",
          },
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
          reactions: {
            $first: "$reactions",
          },
          pined: {
            $first: "$pined",
          },
          active: {
            $first: "$active",
          },
        },
      },

      { $sort: { pined: -1, fechaReceta: -1 } },

      {
        $group: {
          _id: "$_id.userId",
          email: {
            $first: "$email",
          },
          username: {
            $first: "$username",
          },
          profileImageUrl: {
            $first: "$profileImageUrl",
          },
          recetas: {
            $push: {
              _id: "$_id.recetaId",
              titulo: "$titulo",
              descripcion: "$descripcion",
              images: "$images",
              hours: "$hours",
              minutes: "$minutes",
              grupoIngrediente: "$grupoIngrediente",
              cantidadPersonas: "$cantidadPersonas",
              dificultad: "$dificultad",
              categoria: "$categoria",
              subCategoria: "$subCategoria",
              comments: "$comments",
              reactions: "$reactions",
              pined: "$pined",
              active: "$active",
              fechaReceta: "$fechaReceta",
              favourite: "$favourite",
            },
          },
          totalRecetas: {
            $sum: 1,
          },
        },
      },
      {
        $addFields: {
          recetas: {
            $slice: ["$recetas", skip, limit],
          },
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

export const updateFavourite = async (idUser, update) => {
  try {
    const updatedUser = await Usuario.findByIdAndUpdate(idUser, update, {
      new: true,
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
  }

  return updatedUser;
};

export const getUsersDescovery = async (data) => {
  const skip = (data.page - 1) * data.limit;
  const userId = new ObjectId(data.userId);

  const matchStage = {
    _id: { $ne: userId },
  };

  if (data.username) {
    matchStage.username = { $regex: data.username, $options: "i" };
  }

  const orderBy = data.orderBy?.orderBy || "relevante";
  const direction = data.orderBy?.direction === "asc" ? 1 : -1;

  const sortFieldMap = {
    cantidadRecetas: "recetasCount",
    cantidadLike: "totalReactions",
    relevante: "relevanteScore",
  };

  const sortField = sortFieldMap[orderBy] || "relevanteScore";

  try {
    const result = await Usuario.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "recetas",
          localField: "_id",
          foreignField: "user",
          as: "recetas",
        },
      },
      {
        $addFields: {
          recetas: {
            $filter: {
              input: "$recetas",
              as: "receta",
              cond: { $eq: ["$$receta.active", true] },
            },
          },
        },
      },
      {
        $addFields: {
          recetasCount: { $size: "$recetas" },
          totalReactions: {
            $sum: {
              $map: {
                input: "$recetas",
                as: "receta",
                in: { $size: { $ifNull: ["$$receta.reactions", []] } },
              },
            },
          },
        },
      },
      {
        $addFields: {
          relevanteScore: {
            $add: [{ $multiply: ["$recetasCount", 2] }, "$totalReactions"],
          },
        },
      },
      {
        $match: {
          recetasCount: { $gt: 0 },
        },
      },
      {
        $project: {
          email: 1,
          username: 1,
          recetasCount: 1,
          totalReactions: 1,
          relevanteScore: 1,
          profileImageUrl: 1,
        },
      },
      {
        $facet: {
          data: [
            { $sort: { [sortField]: direction, username: -1 } },
            { $skip: skip },
            { $limit: data.limit },
          ],
          totalCount: [{ $count: "count" }],
        },
      },
    ]);

    return {
      usuarios: result[0].data,
      total: result[0].totalCount[0]?.count || 0,
    };
  } catch (error) {
    throw error;
  }
};

export default {
  saveUser,
  obtenerRecetaByIdUser,
  getUserbyEmail,
  getUserbyUsename,
  updateFavourite,
  obtenerFavouriteByIdUser,
  getUserbyId,
};
