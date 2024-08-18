import Item from "../models/itemModel.js";

export const saveItem = async (item, session) => {
    try {
        const newItem = new Item(item);
        if (session) {
            return await newItem.save({ session: session });
        } else {
            return await newItem.save();
        }

    } catch (error) {
        console.log(error);
        throw error;
    }
}

export const updateItem = async (item, session) => {
    try {
        const options = { new: true };
        if (session) {
            options.session = session;
        }
        const resultado = await Item.findByIdAndUpdate(item._id, item, options);
        return resultado;
    } catch (error) {
        console.error('Error al hacer updateItem:', error);
        throw error;
    }
}

export const obtenerItem = async (id) => {
    try {
        const resultado = Item.findById(id).lean();
        return resultado;
    } catch (error) {
        console.error('Error al hacer obtenerItem:', error);
        throw error;
    }
}

export default { saveItem };