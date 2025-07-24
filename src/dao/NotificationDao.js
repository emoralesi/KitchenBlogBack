import Notification from "../models/notificationModel.js";
import { ObjectId } from "mongodb";


export const saveNotification = async (notification) => {
  try {
    const notifications = new Notification(notification);
    return await notifications.save();
  } catch (error) {
    throw error;
  }
};

export const deleteNotification = async (
  idUser,
  idReceta,
  idReference,
  modelo
) => {
  try {
    const notification = await Notification.deleteMany({
      user_action: idUser,
      receta_id: idReceta,
      reference_id: idReference,
      referenceModelo: modelo,
    });
  } catch (error) {
    console.log(error);
  }
};

export const getNotifications = async (idUser, page, limit) => {
  try {
    const idUserNotificated = new ObjectId(idUser);
    const skip = (page - 1) * limit;

    const notificationsData = await Notification.aggregate([
      {
        $match: {
          referenceModelo: { $in: ["Comentario", "Reaction"] },
          user_notificated: idUserNotificated,
        },
      },
      {
        $facet: {
          totalCount: [{ $count: "count" }], // Total de notificaciones
          totalUnreadCount: [
            { $match: { readed: false } }, // Filtra solo las no leídas
            { $count: "count" },
          ],
          paginatedResults: [
            {
              $lookup: {
                from: "comments",
                localField: "reference_id",
                foreignField: "_id",
                as: "comment",
              },
            },
            {
              $lookup: {
                from: "reactions",
                localField: "reference_id",
                foreignField: "_id",
                as: "reaction",
              },
            },
            {
              $lookup: {
                from: "recetas",
                localField: "receta_id",
                foreignField: "_id",
                as: "receta",
              },
            },
            {
              $lookup: {
                from: "comments",
                localField: "comment.parentComment",
                foreignField: "_id",
                as: "parentComment",
              },
            },
            {
              $lookup: {
                from: "usuarios",
                localField: "user_action",
                foreignField: "_id",
                as: "user_action",
              },
            },
            {
              $unwind: {
                path: "$parentComment",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $lookup: {
                from: "usuarios",
                localField: "parentComment.user",
                foreignField: "_id",
                as: "parentComment.user",
              },
            },
            {
              $project: {
                "user_action.password": 0,
                "user_action.favourite": 0,
                "parentComment.user.password": 0,
                "parentComment.user.favourite": 0,
              },
            },
            { $sort: { fecha_notificacion: -1 } }, // Ordenar por fecha descendente
            { $skip: skip },
            { $limit: limit },
          ],
        },
      },
    ]);

    // Extraer los resultados de la consulta
    const totalCount = notificationsData[0].totalCount[0]?.count || 0;
    const totalUnreadCount =
      notificationsData[0].totalUnreadCount[0]?.count || 0;
    const paginatedResults = notificationsData[0].paginatedResults;

    return { totalCount, totalUnreadCount, notifications: paginatedResults };
  } catch (error) {
    throw error;
  }
};

export const NotiReaded = async (datos) => {
  try {
    const resultado = await Notification.updateMany(
      { _id: { $in: datos } },
      { readed: true }
    );

    return resultado;
  } catch (error) {
    console.log(error);
    throw new error();
  }
};

export default { saveNotification };
