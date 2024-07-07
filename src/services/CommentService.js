import { getAnswerdOfComment, getCommentById, saveComment, updateCommentReaction } from "../dao/CommentDao.js";
import { deleteNotification } from "../dao/NotificationDao.js";
import { deleteReaction, getReactionByReceta, saveReaction } from "../dao/ReactionDao.js";
import { getRecetaById } from "../dao/RecetaDao.js";
import { getUserbyId } from "../dao/UserDao.js";
import { sendSSEToUser } from "../routes/routes.js";
import { TypeNotification, TypeReferenceModelo } from "../utils/enumTypeNoti.js";
import { sendNotification } from "../utils/notificationSend.js";

export const guardarComment = async (params, res) => {
    try {

        const comment = {
            content: params.content,
            user: params.user,
            receta: params.receta,
            parentComment: params?.parentComment
        };

        const newComment = await saveComment(comment);

        const user_action = await getUserbyId(params.user);

        const recetaComment = await getRecetaById(params.receta)

        const TypeComment = params.type

        var parentCommentData = null;

        const result = { comment: newComment, user: user_action, receta: recetaComment, parentComment: null, action_noti: TypeComment }
        if (TypeNotification.CommentToAnswerd == params.type) {
            parentCommentData = await getCommentById(params.parentComment)
            result.parentComment = parentCommentData[0];
        }



        //-------------------------------------------------------------------------

        switch (TypeComment) {
            case TypeNotification.CommentToReceta:

                if (params.user != recetaComment.user) {
                    await sendNotification({
                        user_notificated: recetaComment.user.toString(),
                        user_action: params.user.toString(),
                        reference_id: newComment._id,
                        receta_id: params.receta,
                        referenceModelo: TypeReferenceModelo.Comentario,
                        action: TypeNotification.CommentToReceta
                    })
                    sendSSEToUser(recetaComment.user.toString(), result)
                }

                break;

            case TypeNotification.CommentToAnswerd:

                const usuariosDelParentPost = await getAnswerdOfComment(params.parentComment)

                console.log("mis respuestas al parentComment", usuariosDelParentPost);
                let users = [];

                usuariosDelParentPost.forEach(element => {
                    users.push(element.user.toString())
                });

                console.log("mi result parentComment", result.parentComment);
                console.log("mi result parentComment user", result.parentComment.user);

                users.push(result.parentComment.user.toString())

                console.log("despues de agregar las cosicas", users);

                const usuariosNotification = [...new Set(users)];
                console.log("mi array para el elemento", usuariosNotification);

                result.parentComment.user = await getUserbyId(result.parentComment.user.toString());

                usuariosNotification.forEach(async (element) => {
                    if (element !== params.user) {
                        await sendNotification({
                            user_notificated: element,
                            user_action: params.user,
                            reference_id: newComment._id,
                            receta_id: params.receta,
                            referenceModelo: TypeReferenceModelo.Comentario,
                            action: TypeNotification.CommentToAnswerd
                        })
                        sendSSEToUser(element, result);
                    }
                });

                break;

            default:
                break;
        }

        return result;

    } catch (error) {
        console.error('Error al registrar comentario:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar comentario' });
    }
}

export const saveUpdateReactionComment = async (params, res) => {
    console.log("mi params", params);
    try {
        let update;
        var findReaction;
        var saveReactionResult;
        if (params.estado == true) {
            saveReactionResult = await saveReaction({
                user_id: params.idUser,
                referencia_id: params.idReceta,
                referenciaModelo: 'Comentario'
            });
            update = { $addToSet: { reactions: saveReactionResult._id } }; // $addToSet prevents duplicates
        } else if (params.estado == false) {

            findReaction = await getReactionByReceta(params.idUser, params.idReceta)
            update = { $pull: { reactions: findReaction[0]._id.toString() } };
        } else {
            return res.status(400).send({ status: 'warning', message: "Invalid status value. Use 'true' or 'false'." });
        }

        const newComment = await updateCommentReaction(params.idComment, update);

        if (!newComment) {
            return res.status(404).send({ status: 'warning', message: "Comment not found" });
        }

        if (params.estado == false) {
            console.log(params.idUser, params.idReceta, params.idComment);
            await deleteNotification(params.idUser, params.idReceta, params.idComment, 'Reaction');
            await deleteReaction(findReaction[0]._id.toString())
        }

        const getComment = await getCommentById(params.idComment);
        console.log("getComment", getComment);

        const getReceta = await getRecetaById(params.idReceta);
        console.log("getReceta", getReceta);

        const usuarioDetails = await getUserbyId(params.idUser);
        console.log("usuarioDetails", usuarioDetails);

        const result = { comment: getComment[0], receta: getReceta, parentComment: null, user: usuarioDetails, action_noti: params.type }

        if (params.estado == true) {
            switch (params.type) {
                case TypeNotification.LikeToComment:
                    if (params.idUser !== getComment[0].user.toString()) {
                        await sendNotification({
                            user_notificated: getComment[0].user.toString(),
                            user_action: params.idUser,
                            reference_id: params.idComment,
                            receta_id: params.idReceta,
                            referenceModelo: TypeReferenceModelo.Reaction,
                            action: TypeNotification.LikeToComment
                        })
                        console.log("mi notificado : ", getComment[0].user.toString());
                        sendSSEToUser(getComment[0].user.toString(), result)
                    }
                    break;
                case TypeNotification.LikeToAnswerd:
                    const getParentComment = await getCommentById(params.parentComment);
                    console.log("getParentComment", getParentComment);
                    result.parentComment = getParentComment[0];

                    console.log("result final", result);
                    if (params.idUser !== getComment[0].user.toString()) {
                        await sendNotification({
                            user_notificated: getComment[0].user.toString(),
                            user_action: params.idUser,
                            reference_id: params.idComment,
                            receta_id: params.idReceta,
                            referenceModelo: TypeReferenceModelo.Reaction,
                            action: TypeNotification.LikeToAnswerd
                        })
                        console.log("mi notificado : ", getComment[0].user.toString());
                        sendSSEToUser(getComment[0].user.toString(), result)
                    }
                    break;

                default:
                    break;
            }
        }

        res.status(200).send({ status: 200, message: 'suceed' });
    } catch (error) {
        res.status(500).send({ status: 'error', message: error.message });
    }
}