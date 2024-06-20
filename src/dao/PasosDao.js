import Pasos from "../models/pasosModel.js";

export const savePasos = async (pasos) => {

    try {
        const steps = new Pasos(pasos);
        return await steps.save();
    } catch (error) {
        throw error;
    }
}

export default { savePasos }