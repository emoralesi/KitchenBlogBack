import { getCommentOwnerByParentComment, getCommentUserIdByComment, getRecetaUserIdByComment, saveComment, updateCommentReaction } from "../dao/CommentDao.js";
import { TypeNotification, TypeReferenceModelo } from "../utils/enumTypeNoti.js";
import { sendNotification } from "../utils/notificationSend.js";

export const guardarComment = async (params, res) => {
    try {

        // Crear un nuevo comment
        const comment = {
            content: params.content,
            user: params.user,
            receta_id: params.receta,
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
                        receta: params.receta,
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
                            receta: params.receta,
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
                            receta: params.receta,
                            referenceModelo: TypeReferenceModelo.Comentario,
                            action: action_noti

                        })
                    }
                })
            }

        } catch (error) {
            console.error(error);
        }

        return { newComment, userId, action_noti, ownerComment };

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}

export const saveUpdateReactionComment = async (params, res) => {
    try {
        let update;
        if (params.estado == true) {
            // Add to favourites
            update = { $addToSet: { reactions: params.idUser } }; // $addToSet prevents duplicates
        } else if (params.estado == false) {
            // Remove from favourites
            update = { $pull: { reactions: params.idUser } };
        } else {
            return res.status(400).send({ status: 'warning', message: "Invalid status value. Use 'true' or 'false'." });
        }

        const result = await updateCommentReaction(params.idComment, update);

        if (!result) {
            return res.status(404).send({ status: 'warning', message: "Comment not found" });
        }

        if (params.estado == true) {
            //
        }

        res.status(200).send({ status: 200, message: 'suceed' });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
}