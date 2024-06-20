import Item from "../models/itemModel.js";

export const saveItem = async (item) => {

    try {
        const items = new Item(item);
        return await items.save();
    } catch (error) {
        console.log(error)
        throw error;
    }
}

export default { saveItem }