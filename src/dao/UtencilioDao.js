import Utencilio from "../models/utencilioModel.js";

export const saveUtencilio = async (utencilio) => {

    try {
        const Utility = new Utencilio(utencilio);
        return await Utility.save();
    } catch (error) {
        throw error;
    }
}

export const getUtencilios = async () => {

    try {
        const Utility = await Utencilio.find();
        return Utility;
    } catch (error) {
        throw error;
    }
}

export default { saveUtencilio }