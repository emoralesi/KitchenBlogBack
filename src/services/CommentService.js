import { getCommentOwnerByParentComment, getCommentUserIdByComment, getRecetaUserIdByComment, saveComment } from "../dao/CommentDao.js";
import { TypeNotification, TypeReferenceModelo } from "../utils/enumTypeNoti.js";
import { sendNotification } from "../utils/notificationSend.js";

export const guardarComment = async (params, res) => {
    try {

        // Crear un nuevo comment
        const comment = {
            content: params.content,
            user: params.user,
            receta: params.receta,
            reactions: params?.reactions,
            parentComment: params?.parentComment
        };

        const newComment = await saveComment(comment);

        var userId = null;
        const action_noti = params.parentComment
            ? TypeNotification.CommentToAnswerd
            : TypeNotification.CommentToReceta;

        try {

            const idComment = newComment.id;

            // Obtener user_notificated START
            var userNotificated;
            var ownerComment = null;

            if (params.parentComment) {
                userNotificated = await getCommentUserIdByComment(params.parentComment);
                ownerComment = await getCommentOwnerByParentComment(params.parentComment);

                let FromatUserId = userNotificated[0].result.map(comment => comment.user.toString());
                userId = Array.from(new Set(FromatUserId));

                if (newComment.user.toString() !== ownerComment[0].user.toString()) {
                    await sendNotification({
                        user_notificated: ownerComment[0].user.toString(),
                        user_action: params.user,
                        reference_id: idComment,
                        referenceModelo: TypeReferenceModelo.Comentario,
                        action: action_noti

                    })
                }

                userId.map(async (value) => {
                    if ((value !== ownerComment[0].user.toString()) && value !== newComment.user.toString()) {
                        await sendNotification({
                            user_notificated: value,
                            user_action: params.user,
                            reference_id: idComment,
                            referenceModelo: TypeReferenceModelo.Comentario,
                            action: action_noti

                        })
                    }
                })

            } else {
                userNotificated = await getRecetaUserIdByComment(idComment);
                userId = [userNotificated[0].result[0].user.toString()];

                userId?.map(async (value) => {
                    if (value !== params.user) {
                        await sendNotification({
                            user_notificated: value,
                            user_action: params.user,
                            reference_id: idComment,
                            referenceModelo: TypeReferenceModelo.Comentario,
                            action: action_noti

                        })
                    }
                })
            }

            // END




        } catch (error) {
            console.error(error);
        }

        return { newComment, userId, action_noti, ownerComment };

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}