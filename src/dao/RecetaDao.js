import { ObjectId } from "mongodb";
import Receta from "../models/recetaModel.js";

export const saveReceta = async (receta) => {
  try {
    const Recetas = new Receta(receta);
    return await Recetas.save();
  } catch (error) {
    throw error;
  }
};

export const updateReceta = async (receta) => {
  try {
    const recetas = await Receta.findByIdAndUpdate(receta._id, receta, {
      new: true,
      runValidators: true,
    }).lean();
    return recetas;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const actualizarPined = async (datos) => {
  try {
    const resultado = await Receta.findByIdAndUpdate(
      datos.id,
      { pined: datos.action },
      { new: true, fields: { pined: 1 } }
    );
    return resultado;
  } catch (error) {
    console.log(error);
    throw new error();
  }
};

export const desactivateRecipe = async (id) => {
  try {
    const resultado = await Receta.findByIdAndUpdate(
      id,
      { active: false },
      { new: true, fields: { active: 1 } }
    );
    return resultado;
  } catch (error) {
    console.log(error);
    throw new error();
  }
};

export const updateRecetaReaction = async (idReceta, update) => {
  try {
    const updateReaction = await Receta.findByIdAndUpdate(idReceta, update, {
      new: true,
    });
    return updateReaction;
  } catch (error) {
    console.log(error);
  }

  return updatedUser;
};

export const getRecetaById = async (idReceta) => {
  try {
    const receta = await Receta.findById(idReceta).lean();
    return receta;
  } catch (error) {
    console.log(error);
  }

  return updatedUser;
};

export const getRecetasInfo = async (page, limit, filters) => {
  const skip = (page - 1) * limit;

  try {
    let match = { active: true };
    let ingredienteMatch = {};

    if (filters?.titulo) {
      match.titulo = { $regex: filters?.titulo, $options: "i" }; // Busca el título que contenga el texto, insensible a mayúsculas/minúsculas
    }

    if (filters?.dificultad) {
      const dificultadId = new ObjectId(filters.dificultad);
      match.dificultad = { $eq: dificultadId };
    }

    if (filters?.categoria) {
      const categoriaId = new ObjectId(filters.categoria);
      match.categoria = { $eq: categoriaId };
    }

    console.log(
      "deberia ser true",
      filters?.subCategoria && filters?.subCategoria.length > 0
    );

    if (filters?.subCategoria && filters?.subCategoria.length > 0) {
      const subCategoriasModificadas = filters.subCategoria.map(
        (element) => new ObjectId(element)
      );

      console.log("mi new categorias mod", subCategoriasModificadas);

      match.subCategoria = { $all: subCategoriasModificadas }; // Filtra por las categorías especificadas
    }

    if (filters?.ingredientes?.length > 0) {
      const ingredienteModificado = filters.ingredientes.map(
        (element) => new ObjectId(element)
      );

      console.log("mi ingrediente mod", ingredienteModificado);

      ingredienteMatch = {
        "grupoIngrediente.item.ingrediente._id": {
          $all: ingredienteModificado,
        },
      };
    }
    const recetas = await Receta.aggregate([
      {
        $match: match,
      },
      { $sort: { fechaReceta: -1 } },
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
        $facet: {
          totalRecetas: [
            {
              $count: "count",
            },
          ],
          recetas: [
            {
              $lookup: {
                from: "usuarios",
                let: {
                  userId: "$user",
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
                as: "user",
              },
            },
            {
              $lookup: {
                from: "dificultads",
                localField: "dificultad",
                foreignField: "_id",
                as: "dificultad",
              },
            },
            {
              $lookup: {
                from: "categorias",
                localField: "categoria",
                foreignField: "_id",
                as: "categoria",
              },
            },
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "receta",
                as: "comments",
              },
            },
            {
              $unwind: {
                path: "$subCategoria",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "subcategorias",
                localField: "subCategoria",
                foreignField: "_id",
                as: "subCategoria",
              },
            },
            {
              $addFields: {
                subCategoria: {
                  $cond: {
                    if: {
                      $isArray: "$subCategoria",
                    },
                    then: {
                      $arrayElemAt: ["$subCategoria", 0],
                    },
                    else: "$subCategoria",
                  },
                },
              },
            },
            {
              $group: {
                _id: "$_id",
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
                grupoIngrediente: {
                  $first: "$grupoIngrediente",
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
                comments: {
                  $first: "$comments",
                },
                favourite: {
                  $first: "$favourite",
                },
                user: {
                  $first: "$user",
                },
                pined: {
                  $first: "$pined",
                },
                active: {
                  $first: "$active",
                },
                fechaReceta: {
                  $first: "$fechaReceta",
                },
                subCategoria: {
                  $addToSet: "$subCategoria",
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
                  },
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
                user: {
                  $first: "$user",
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
                user: {
                  $first: "$user",
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
            {
              $group: {
                _id: "$_id",
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
                grupoIngrediente: {
                  $first: "$grupoIngrediente",
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
                subCategoria: {
                  $first: "$subCategoria",
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
                fechaReceta: {
                  $first: "$fechaReceta",
                },
                favourite: {
                  $first: "$favourite",
                },
                user: {
                  $first: "$user",
                },
              },
            },
            {
              $sort: {
                fechaReceta: -1,
              },
            },
            {
              $match: ingredienteMatch,
            },
            {
              $skip: skip,
            },
            {
              $limit: limit,
            },
          ],
        },
      },
      {
        $project: {
          total: {
            $arrayElemAt: ["$totalRecetas.count", 0],
          },
          recetas: "$recetas",
        },
      },
    ]).exec();

    return {
      total: recetas[0].total,
      recetas: recetas[0].recetas,
    };
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export const getRecetaComentReactions = async (idReceta) => {
  try {
    const RecetaId = new ObjectId(idReceta);
    return await Receta.aggregate([
      {
        $match: {
          _id: RecetaId,
          active: true,
        },
      },
      {
        $lookup: {
          from: "pasos",
          localField: "pasos",
          foreignField: "_id",
          as: "pasos",
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
            },
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
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
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
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "_id",
          foreignField: "receta",
          as: "comments",
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
        $unwind: {
          path: "$comments",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "comments.user",
          foreignField: "_id",
          as: "comments.user",
        },
      },
      {
        $match: {
          "comments.parentComment": null,
        },
      },
      {
        $lookup: {
          from: "comments",
          localField: "comments._id",
          foreignField: "parentComment",
          as: "comments.responses",
        },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "comments.reactions",
          foreignField: "_id",
          as: "comments.reactions",
        },
      },
      {
        $unwind: {
          path: "$comments.responses",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "usuarios",
          localField: "comments.responses.user",
          foreignField: "_id",
          as: "comments.responses.user",
        },
      },
      {
        $lookup: {
          from: "reactions",
          localField: "comments.responses.reactions",
          foreignField: "_id",
          as: "comments.responses.reactions",
        },
      },
      {
        $unwind: {
          path: "$comments.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: "$comments.responses.user",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $group: {
          _id: {
            id: "$_id",
            commentId: "$comments._id",
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
          grupoIngrediente: {
            $first: "$grupoIngrediente",
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
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comment: {
            $first: "$comments",
          },
          responses: {
            $push: "$comments.responses",
          },
        },
      },
      {
        $group: {
          _id: "$_id.id",
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
          grupoIngrediente: {
            $first: "$grupoIngrediente",
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
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $push: {
              _id: "$comment._id",
              content: "$comment.content",
              receta: "$comment.receta",
              user: "$comment.user",
              reactions: "$comment.reactions",
              dateComment: "$comment.dateComment",
              parentComment: "$comment.parentComment",
              responses: "$responses",
            },
          },
        },
      },
      {
        $project: {
          commentUsers: 0,
          responseUsers: 0,
          "comments.user.password": 0,
          "comments.responses.user.password": 0,
        },
      },
    ]);
  } catch (error) {
    throw error;
  }
};

export const updateFavouriteReceta = async (idReceta, update) => {
  try {
    const updatedUser = await Receta.findByIdAndUpdate(idReceta, update, {
      new: true,
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
  }

  return updatedUser;
};

export const updateReactionReceta = async (idReceta, update) => {
  try {
    const updatedUser = await Receta.findByIdAndUpdate(idReceta, update, {
      new: true,
    });
    return updatedUser;
  } catch (error) {
    console.log(error);
  }

  return updatedUser;
};

export const getIngredientesByReceta = async (idReceta) => {
  try {
    const RecetaId = new ObjectId(idReceta);
    return await Receta.aggregate([
      {
        $match: {
          _id: RecetaId,
          active: true,
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
            },
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
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
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
          fechaReceta: {
            $first: "$fechaReceta",
          },
          comments: {
            $first: "$comments",
          },
        },
      },
      {
        $project: {
          grupoIngrediente: 1,
        },
      },
    ]);
  } catch (error) {}
};

export const obtenerShopping = async (idRecetas) => {
  idRecetas.forEach((element, index, arr) => {
    arr[index] = new ObjectId(element);
  });

  console.log("mi idReceta", idRecetas);

  try {
    const shopping = Receta.aggregate([
      {
        $match: {
          _id: {
            $in: idRecetas,
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
        $lookup: {
          from: "items",
          localField: "grupoIngrediente.item",
          foreignField: "_id",
          as: "grupoIngrediente.items",
        },
      },
      {
        $unwind: "$grupoIngrediente.items",
      },
      {
        $lookup: {
          from: "medidas",
          localField: "grupoIngrediente.items.medida",
          foreignField: "_id",
          as: "grupoIngrediente.items.medida",
        },
      },
      {
        $unwind: "$grupoIngrediente.items.medida",
      },
      {
        $lookup: {
          from: "ingredientes",
          localField: "grupoIngrediente.items.ingrediente",
          foreignField: "_id",
          as: "grupoIngrediente.items.ingrediente",
        },
      },
      {
        $unwind: "$grupoIngrediente.items.ingrediente",
      },
      {
        $group: {
          _id: "$_id",
          titulo: {
            $first: "$titulo",
          },
          // Agregar el campo titulo
          grupoIngrediente: {
            $first: "$grupoIngrediente",
          },
          items: {
            $push: "$grupoIngrediente.items",
          },
        },
      },
      {
        $project: {
          titulo: 1,
          // Incluir el campo titulo en la proyección
          "grupoIngrediente.items": "$items",
        },
      },
    ]);

    return shopping;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export default { saveReceta, getRecetaComentReactions };
