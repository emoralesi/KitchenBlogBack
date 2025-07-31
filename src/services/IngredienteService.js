import {
  getIngredientePorNombre,
  saveIngrediente,
} from "../dao/IngredienteDao.js";

export const guardarIngrediente = async (nuevoIngrediente, res) => {
  try {

    if (!nuevoIngrediente) {
      return res.status(400).json({
        status: "warning",
        message: `El ingrediente no puede estar vacio`,
      });
    }

    const validarExistente = await getIngredientePorNombre(nuevoIngrediente);

    if (validarExistente) {
      return res.status(400).json({
        status: "warning",
        message: `EL ingrediente ${nuevoIngrediente} ya existe `,
      });
    }

    const ingrediente = await saveIngrediente(nuevoIngrediente);
    res.status(200).json({ status: "ok", data: ingrediente });
  } catch (error) {
    console.error("Error al registrar Ingrediente:", error);
    return res.status(500).json({
      status: "error",
      message: "Error interno del servidor al registrar Ingrediente",
    });
  }
};

export default { guardarIngrediente };
