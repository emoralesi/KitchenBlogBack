import { saveGrupoIngrediente } from "../dao/GrupoIngredienteDao.js";
import { saveItem } from "../dao/ItemDao.js";
import { savePasos } from "../dao/PasosDao.js";
import { getRecetaById, getRecetaComentReactions, saveReceta, updateRecetaReaction } from "../dao/RecetaDao.js";
import { getUserbyId, obtenerRecetaByIdUser } from "../dao/UserDao.js";
import mongoose from 'mongoose';
import { TypeNotification, TypeReferenceModelo } from "../utils/enumTypeNoti.js";
import { sendNotification } from "../utils/notificationSend.js";
import { sendSSEToUser } from "../routes/routes.js";
import { deleteReaction, getReactionByReceta, saveReaction } from "../dao/ReactionDao.js";
import { deleteNotification } from "../dao/NotificationDao.js";

export const GetRecetasByIdUser = async (params, res) => {
    console.log(params);
    try {
        const Recetas = await obtenerRecetaByIdUser(params.userId);
        console.log(Recetas);
        console.log(Recetas[0]?.recetas?.length);
        if (Recetas[0]?.recetas?.length > 0) {
            res.status(200).json({ status: 'ok', message: 'Se encontraron ' + Recetas[0].recetas.length + ' Recetas', Recetas: Recetas[0].recetas });
        } else {
            res.status(200).json({ status: 'notContent', message: 'No se encontraron Recetas', Recetas: Recetas[0]?.recetas });
        }
    } catch (error) {
        console.error('Error al obtener usuarios Recetas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener Recetas usuarios' });
    }
}

export const GetFullRecetaById = async (params, res) => {
    console.log(params);
    try {
        const Recetas = await getRecetaComentReactions(params.recetaId);
        console.log(Recetas);
        if (Recetas.length > 0) {
            res.status(200).json({ status: 'ok', message: 'Se encontraron ' + Recetas.length + ' Receta', Receta: Recetas[0] });
        } else {
            res.status(200).json({ status: 'notContent', message: 'No se encontraron Recetas' });
        }
    } catch (error) {
        console.error('Error al obtener usuarios Recetas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener Recetas usuarios' });
    }
}

export const saveUpdateReactionReceta = async (params, res) => {
    try {
        let update;
        console.log(params);
        var findReaction;
        var saveReactionResult;
        if (params.estado == true) {

            saveReactionResult = await saveReaction({
                user_id: params.idUser,
                referencia_id: params.idReceta,
                referenciaModelo: 'Receta'
            });

            update = { $addToSet: { reactions: saveReactionResult._id } }; // $addToSet prevents duplicates

        } else if (params.estado == false) {

            findReaction = await getReactionByReceta(params.idUser, params.idReceta)

            update = { $pull: { reactions: findReaction[0]._id.toString() } };
        } else {
            return res.status(400).send({ status: 'warning', message: "Invalid status value. Use 'true' or 'false'." });
        }

        const reactionNew = await updateRecetaReaction(params.idReceta, update);

        if (!reactionNew) {
            return res.status(404).send({ status: 'warning', message: "User not found" });
        }

        if (params.estado == false) {
            console.log(params.idUser);
            console.log(params.idReceta);
            console.log(findReaction[0]._id.toString());
            await deleteNotification(params.idUser, params.idReceta, findReaction[0]._id.toString(), 'Reaction');
            await deleteReaction(findReaction[0]._id.toString())
        }
        console.log("mi reactionNew", reactionNew);

        const userAction = await getUserbyId(params.idUser);

        console.log("userAction", userAction);

        const recetaNoti = await getRecetaById(params.idReceta);

        console.log("recetaNoti", recetaNoti);

        const result = { reaction: reactionNew, user: userAction, receta: recetaNoti, action_noti: params.type }

        console.log("mi result", result);

        console.log(params.estado);
        console.log(params.estado == true);
        if (params.estado == true) {
            console.log(params.idUser);
            console.log(recetaNoti.user.toString())
            console.log(params.idUser !== recetaNoti.user.toString());
            if (params.idUser !== recetaNoti.user.toString()) {
                await sendNotification({
                    user_notificated: recetaNoti.user.toString(),
                    user_action: params.idUser,
                    reference_id: saveReactionResult._id.toString(),
                    receta_id: params.idReceta,
                    referenceModelo: TypeReferenceModelo.Reaction,
                    action: TypeNotification.LikeToReceta
                })
                console.log("mi notificado : ", recetaNoti.user.toString());
                sendSSEToUser(recetaNoti.user.toString(), result)
            }
        }

        res.status(200).send({ status: 200, message: 'suceed' });
    } catch (error) {
        console.log(error);
        res.status(500).send({ status: 'error', message: error.message });
    }
}

export const guardarReceta = async (params, res) => {

    params.images = ['https://via.placeholder.com/400'];

    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("mi params", params);
    try {
        var gruposId = [];
        for (const values of params.grupoIngrediente) {
            var items = [];
            for (const valueItems of values.items) {
                const result = await saveItem({ valor: valueItems.valor, ingrediente: valueItems.idIngrediente, medida: valueItems.idMedida }, { session });
                items.push(result._id);
            }
            const resultGrupo = await saveGrupoIngrediente({ nombreGrupo: values.nombreGrupo, item: items }, { session });
            gruposId.push(resultGrupo._id);
            items = [];
        }
        params.grupoIngrediente = gruposId;

        var pasosId = [];
        for (const values of params.pasos) {
            const resultPasos = await savePasos(values, { session });
            pasosId.push(resultPasos._id);
        }
        params.pasos = pasosId;

        const newReceta = await saveReceta(params, { session });

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ status: 'ok', receta: newReceta, message: 'Receta registrado con éxito' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error al registrar Receta:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar usuario' });
    }
}