import Pasos from "../models/pasosModel.js";

export const savePasos = async (pasos) => {

    try {
        const steps = new Pasos(pasos);
        return await steps.save();
    } catch (error) {
        throw error;
    }
}

export const buscarPaso = async (id) => {

    try {
        const steps = await Pasos.findById(id).lean();
        return steps;
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export const updatePaso = async (paso) => {
    try {
        const resultado = await Pasos.findByIdAndUpdate(paso._id, paso, { new: true });
        return resultado;
    } catch (error) {
        console.error('Error al hacer updatePaso:', error);
        throw error;
    }
}

export default { savePasos }