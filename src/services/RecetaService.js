import { obtenerGrupoIngrediente, saveGrupoIngrediente, updateGrupoIngrediente } from "../dao/GrupoIngredienteDao.js";
import { obtenerItem, saveItem, updateItem } from "../dao/ItemDao.js";
import { buscarPaso, savePasos, updatePaso } from "../dao/PasosDao.js";
import { getRecetaById, getRecetaComentReactions, saveReceta, updateReceta, updateRecetaReaction } from "../dao/RecetaDao.js";
import { getUserbyId, obtenerRecetaByIdUser } from "../dao/UserDao.js";
import mongoose from 'mongoose';
import { TypeNotification, TypeReferenceModelo } from "../utils/enumTypeNoti.js";
import { sendNotification } from "../utils/notificationSend.js";
import { sendSSEToUser } from "../routes/routes.js";
import { deleteReaction, getReactionByReceta, saveReaction } from "../dao/ReactionDao.js";
import { deleteNotification } from "../dao/NotificationDao.js";
import { compareRecetas } from "../utils/compareReceta.js";
import path from 'path'

export const GetRecetasByIdUser = async (params, res) => {
    console.log(params);
    try {
        const Recetas = await obtenerRecetaByIdUser(params.userId);
        console.log(Recetas)
        if (Recetas[0]?.recetas?.length > 0) {
            res.status(200).json({ status: 'ok', message: 'Se encontraron ' + Recetas[0].recetas.length + ' Recetas', Recetas: Recetas[0].recetas });
        } else {
            res.status(200).json({ status: 'notContent', message: 'No se encontraron Recetas', Recetas: [] });
        }
    } catch (error) {
        console.error('Error al obtener usuarios Recetas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener Recetas usuarios', Recetas: null });
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
            res.status(200).json({ status: 'notContent', message: 'No se encontraron Recetas', Receta: [] });
        }
    } catch (error) {
        console.error('Error al obtener usuarios Recetas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener Recetas usuarios', Receta: null });
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

            update = { $addToSet: { reactions: saveReactionResult._id.toString() } }; // $addToSet prevents duplicates

        } else if (params.estado == false) {

            findReaction = await getReactionByReceta(params.idUser, params.idReceta)

            update = { $pull: { reactions: findReaction[0]._id.toString() } };
        } else {
            return res.status(400).send({ status: 'warning', message: "Invalid status value. Use 'true' or 'false'." });
        }

        console.log("update", update);

        const reactionNew = await updateRecetaReaction(params.idReceta, update);

        if (!reactionNew) {
            return res.status(404).send({ status: 'warning', message: "User not found" });
        }

        if (params.estado == false) {
            await deleteNotification(params.idUser, params.idReceta, findReaction[0]._id.toString(), 'Reaction');
            await deleteReaction(findReaction[0]._id.toString())
        }

        const userAction = await getUserbyId(params.idUser);

        const recetaNoti = await getRecetaById(params.idReceta);

        const result = { reaction: reactionNew, user: userAction, receta: recetaNoti, action_noti: params.type }

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

export const guardarReceta = async (params, res, imageRecipes, imageSteps, cloudinary) => {

    let uploadedRecipeImages = []

    for (const file of imageRecipes) {
        console.log("Desgloce ----");

        const optimizedUrl = await cloudinary.uploader.upload(file.path, {
            folder: 'Recipe_images',
            format: 'png',
            fetch_format: 'auto',
            quality: 'auto',
            asset_folder: 'Recipe_images'
        });
        uploadedRecipeImages.push(optimizedUrl.url);  // Agrega la URL de la imagen subida
    }

    console.log("pase bien");

    params.images = uploadedRecipeImages;;

    params.pined = false;
    params.active = true;

    // const session = await mongoose.startSession();
    // session.startTransaction();
    console.log("mi params", params);
    try {
        var gruposId = [];
        for (const values of params.grupoIngrediente) {

            var items = [];
            for (const valueItems of values.items) {
                const result = await saveItem({ valor: valueItems.valor, ingrediente: valueItems.idIngrediente, medida: valueItems.idMedida });
                items.push(result._id);
            }
            const resultGrupo = await saveGrupoIngrediente({ nombreGrupo: values.nombreGrupo, item: items });
            gruposId.push(resultGrupo._id);
            items = [];
        }
        params.grupoIngrediente = gruposId;

        var pasosId = [];
        params.pasos.forEach(async (values, index) => {
            var optimizedUrl = null;

            if (imageSteps) {
                optimizedUrl = await cloudinary.uploader.upload(imageSteps[index].path, {
                    folder: 'Steps_images',
                    format: 'png',
                    fetch_format: 'auto',
                    quality: 'auto',
                    asset_folder: 'Steps_images'
                });
            }

            values.imageStep = optimizedUrl ? optimizedUrl.url : null;
            const resultPasos = await savePasos(values);
            pasosId.push(resultPasos._id);
        });
        params.pasos = pasosId;
        params.favourite = [];

        const newReceta = await saveReceta(params);

        //await session.commitTransaction();
        //session.endSession();

        return res.status(200).json({ status: 'ok', receta: newReceta, message: 'Receta registrada con éxito' });

    } catch (error) {
        // await session.abortTransaction();
        //session.endSession();
        console.error('Error al registrar Receta:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al registrar receta' });
    }
}

export const actualizarReceta = async (params, res) => {

    const session = await mongoose.startSession();
    session.startTransaction();
    console.log("mi params", params);
    try {
        var gruposId = [];
        for (const values of params.grupoIngrediente) {
            var items = [];

            if (values._id) {

                const originalGrupoIngrediente = await obtenerGrupoIngrediente(values._id);

                gruposId.push(values._id);
                var enableUpdate = false;

                for (const valueItems of values.items) {

                    if (valueItems._id) {

                        items.push(valueItems._id)

                        const originalItem = await obtenerItem(valueItems._id);
                        if (valueItems.valor !== originalItem.valor || valueItems.idIngrediente !== originalItem.ingrediente.toString() || valueItems.idMedida !== originalItem.medida.toString()) {
                            await updateItem({ _id: valueItems._id, valor: valueItems.valor, ingrediente: valueItems.idIngrediente, medida: valueItems.idMedida })
                        }
                    } else {
                        const result = await saveItem({ valor: valueItems.valor, ingrediente: valueItems.idIngrediente, medida: valueItems.idMedida });
                        items.push(result._id.toString());
                        enableUpdate = true;
                    }
                }

                if (enableUpdate || originalGrupoIngrediente !== values) {
                    updateGrupoIngrediente({ _id: values._id, nombreGrupo: values.nombreGrupo, item: items });
                }

            } else {

                for (const valueItems of values.items) {
                    const result = await saveItem({ valor: valueItems.valor, ingrediente: valueItems.idIngrediente, medida: valueItems.idMedida });
                    items.push(result._id.toString());
                }
                const resultGrupo = await saveGrupoIngrediente({ nombreGrupo: values.nombreGrupo, item: items });
                gruposId.push(resultGrupo._id.toString());
                items = [];
            }
        }
        params.grupoIngrediente = gruposId;

        var pasosId = [];
        for (const values of params.pasos) {
            if (values._id) {
                pasosId.push(values._id);

                const originalPasos = await buscarPaso(values._id);

                if (values.pasoNumero !== originalPasos.pasoNumero || values.descripcion !== originalPasos.descripcion) {
                    updatePaso({ _id: values._id, pasoNumero: values.pasoNumero, descripcion: values.descripcion });
                }

            } else {
                const resultPasos = await savePasos(values);
                pasosId.push(resultPasos._id.toString());
            }

        }
        params.pasos = pasosId;

        const originalReceta = await getRecetaById(params._id)

        console.log(originalReceta);
        console.log(params);
        params.images = originalReceta.images;
        params.favourite = originalReceta.favourite;

        var newReceta = null;

        if (!compareRecetas(params, originalReceta)) {
            newReceta = await updateReceta(params);
        }

        await session.commitTransaction();
        session.endSession();

        return res.status(200).json({ status: 'ok', receta: newReceta, message: 'Receta registrado con éxito' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error al actualizar Receta:', error);
        return res.status(500).json({ status: 'error', message: 'Error interno del servidor al actualizar receta' });
    }
}