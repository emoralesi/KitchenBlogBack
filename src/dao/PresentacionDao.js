import Presentacion from "../models/presentacionModel.js";

export const savePresentacion = async (presentacion) => {
  try {
    const presentation = new Presentacion(presentacion);
    return await presentation.save();
  } catch (error) {
    throw error;
  }
};

export const getPresentacion = async () => {
  try {
    const presentation = await Presentacion.find();
    return presentation;
  } catch (error) {
    throw error;
  }
};

export default { savePresentacion, getPresentacion };
