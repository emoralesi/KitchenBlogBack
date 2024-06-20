import { saveGrupoIngrediente } from "../dao/GrupoIngredienteDao.js";
import { saveItem } from "../dao/ItemDao.js";
import { savePasos } from "../dao/PasosDao.js";
import { getRecetaComentReactions, saveReceta } from "../dao/RecetaDao.js";
import { obtenerRecetaByIdUser } from "../dao/UserDao.js";
import mongoose from 'mongoose';

export const GetRecetasByIdUser = async (params, res) => {
    console.log(params);
    try {
        const Recetas = await obtenerRecetaByIdUser(params.userId);
        console.log(Recetas);
        if (Recetas[0]?.Recetaeos.length > 0) {
            res.status(200).json({ status: 'ok', message: 'Se encontraron ' + Recetas[0].Recetaeos.length + ' Recetas', Recetas: Recetas[0].Recetaeos });
        } else {
            res.status(200).json({ status: 'notContent', message: 'No se encontraron Recetas' });
        }
    } catch (error) {
        console.error('Error al obtener usuarios Recetas:', error);
        return res.status(500).json({ message: 'Error interno del servidor al obtener Recetas usuarios' });
    }
}

export const GetFullRecetaById = async (params, res) => {
    console.log(params);
    try {
        const Recetas = await getRecetaComentReactions(params.RecetaId);
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

export const guardarReceta = async (params, res) => {

    params.images = [''];

    const session = await mongoose.startSession();
    session.startTransaction();

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

        return res.status(200).json({ Receta: newReceta, message: 'Receta registrado con éxito' });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error al registrar Receta:', error);
        return res.status(500).json({ message: 'Error interno del servidor al registrar usuario' });
    }
}