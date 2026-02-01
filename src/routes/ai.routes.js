import { Router } from "express";
import { generarRecetaIA } from "../services/huggingface.service.js";

const routerIA = Router();

routerIA.post("/ai/receta", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        error: "El campo 'message' es obligatorio",
      });
    }

    const receta = await generarRecetaIA([
      {
        role: "user",
        content: message,
      },
    ]);

    res.json({
      success: true,
      receta,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default routerIA;