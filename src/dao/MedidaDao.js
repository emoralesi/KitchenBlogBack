import Medida from "../models/medidaModel.js";

export const saveMedida = async (medida) => {

    try {
        const mesure = new Medida(medida);
        return await mesure.save();
    } catch (error) {
        throw error;
    }
}

export const getMedida = async () => {

    try {
        const Medidas = await Medida.find();
        return Medidas;
    } catch (error) {
        throw error;
    }
}

export default { saveMedida }