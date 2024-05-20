import { getCommentUserIdByComment, getPostUserIdByComment, saveComment } from "../dao/CommentDao.js";
import { TypeNotification, TypeReferenceModelo } from "../utils/enumTypeNoti.js";
import { sendNotification } from "../utils/notificationSend.js";

export const guardarComment = async (params, res) => {
    try {

        // Crear un nuevo comment
        const comment = {
            content: params.content,
            user: params.user,
            post: params.post,
            reactions: params?.reactions,
            parentComment: params?.parentComment
        };

        const newComment = await saveComment(comment);

        var userId = null;
        const action_noti = params.parentComment
            ? TypeNotification.CommentToAnswerd
            : TypeNotification.CommentToPost;

        try {

            const idComment = newComment.id;

            // Obtener user_notificated START
            var userNotificated;
            var owenerComment = null;

            if (params.parentComment) {
                userNotificated = await getCommentUserIdByComment(params.parentComment);
                owenerComment = { user: userNotificated[0].user }

                let FromatUserId = userNotificated[0].result.map(comment => comment.user.toString());
                userId = Array.from(new Set(FromatUserId));

                if (newComment.user.toString() !== owenerComment.user.toString()) {
                    await sendNotification({
                        user_notificated: owenerComment.user.toString(),
                        user_action: params.user,
                        reference_id: idComment,
                        referenceModelo: TypeReferenceModelo.Comentario,
                        action: action_noti

                    })
                }

                userId.map(async (value) => {
                    if ((value !== owenerComment.user.toString()) && value !== newComment.user.toString()) {
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
                userNotificated = await getPostUserIdByComment(idComment);
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

        return { newComment, userId, action_noti, owenerComment };

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}