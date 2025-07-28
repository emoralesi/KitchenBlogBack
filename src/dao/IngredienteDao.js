import Ingrediente from "../models/ingredienteModel.js";

export const saveIngrediente = async (nombreIngrediente) => {
  try {
    const ingredient = new Ingrediente({nombreIngrediente: nombreIngrediente});
    return await ingredient.save();
  } catch (error) {
    throw error;
  }
};

export const getIngrediente = async () => {
  try {
    const Ingredientes = await Ingrediente.find();
    return Ingredientes;
  } catch (error) {
    throw error;
  }
};

export const getIngredientePorNombre = async (nombreIngrediente) => {
  try {
    const ingrediente = await Ingrediente.findOne({
      nombreIngrediente: { $regex: new RegExp(`^${nombreIngrediente}$`, "i") },
    });
    return ingrediente;
  } catch (error) {
    throw error;
  }
};
