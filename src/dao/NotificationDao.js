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
                $addFields: {
                    item: {
                        $cond: {
                            if: {
                                $gt: [
                                    {
                                        $size: "$comment"
                                    },
                                    0
                                ]
                            },
                            then: {
                                type: "Comentario",
                                postId: "$comment.post"
                            },
                            else: {
                                type: "Reaction",
                                postId: "$reaction.post"
                            }
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "posts",
                    localField: "item.postId",
                    foreignField: "_id",
                    as: "item.PostInfo"
                }
            },
            {
                $addFields: {
                    "comment.parentComment": {
                        $cond: {
                            if: {
                                $isArray: "$comment.parentComment"
                            },
                            then: {
                                $arrayElemAt: [
                                    "$comment.parentComment",
                                    0
                                ]
                            },
                            else: null
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "comments",
                    localField: "comment.parentComment",
                    foreignField: "_id",
                    as: "parentComment"
                }
            }
        ]);
        return notifications
    } catch (error) {
        throw error
    }
}

export default { saveNotification }