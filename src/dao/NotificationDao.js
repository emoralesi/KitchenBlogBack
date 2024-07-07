import Notification from "../models/NotificationModel.js";
import { ObjectId } from 'mongodb';


export const saveNotification = async (notification) => {
    try {
        const notifications = new Notification(notification);
        return await notifications.save();
    } catch (error) {
        throw error;
    }
}

export const deleteNotification = async (idUser, idReceta, idReference, modelo) => {
    try {
        const notification = await Notification.deleteMany({ user_action: idUser, receta_id: idReceta, reference_id: idReference, referenceModelo: modelo })
    } catch (error) {
        console.log(error);
    }
}

export const getNotifications = async (idUser) => {

    try {
        const idUserNotificated = new ObjectId(idUser);

        const notifications = Notification.aggregate([
            {
                $match: {
                    referenceModelo: {
                        $in: ["Comentario", "Reaction"]
                    },
                    user_notificated: idUserNotificated
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "reference_id",
                    foreignField: "_id",
                    as: "comment"
                }
            },
            {
                $lookup: {
                    from: "reactions",
                    localField: "reference_id",
                    foreignField: "_id",
                    as: "reaction"
                }
            },
            {
                $lookup: {
                    from: "recetas",
                    localField: "receta_id",
                    foreignField: "_id",
                    as: "receta"
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "comment.parentComment",
                    foreignField: "_id",
                    as: "parentComment"
                }
            },
            {
                $lookup: {
                    from: "usuarios",
                    localField: "user_action",
                    foreignField: "_id",
                    as: "user_action"
                }
            },
            {
                $unwind: {
                    path: "$parentComment",
                    preserveNullAndEmptyArrays: true
                }
            }
            ,
            {
                $lookup: {
                    from: "usuarios",
                    localField: "parentComment.user",
                    foreignField: "_id",
                    as: "parentComment.user"
                }
            },
            {
                $project: {
                    "user_action.password": 0,
                    "user_action.favourite": 0,
                    "parentComment.user.password": 0,
                    "parentComment.user.favourite": 0
                }
            }
        ]);
        return notifications
    } catch (error) {
        throw error
    }
}

export default { saveNotification }