import { InferenceClient } from "@huggingface/inference";

const client = new InferenceClient(process.env.HF_TOKEN);


// 👉 MODELOS MONGOOSE (ajusta las rutas si cambian)
import Ingrediente from "../models/ingredienteModel.js";
import Medida from "../models/medidaModel.js";
import Dificultad from "../models/dificultadModel.js";
import Categoria from "../models/categoriaModel.js";
import SubCategoria from "../models/subCategoriaModel.js";
import Utensilio from "../models/utencilioModel.js";


/**
 * @param {Array} messages - [{ role: "user", content: "..." }]
 */
export const generarRecetaIA = async (messages = []) => {
  try {
    if (!Array.isArray(messages) || messages.length === 0) {
      throw new Error("Se requiere al menos un mensaje del usuario");
    }
    // 1️⃣ Obtener catálogos desde MongoDB
    const [
      ingredientes,
      medidas,
      dificultades,
      categorias,
      subcategorias,
      utensilios,
    ] = await Promise.all([
      Ingrediente.find({}, "_id nombreIngrediente").lean(),
      Medida.find({}, "_id nombreMedida").lean(),
      Dificultad.find({}, "_id nombreDificultad").lean(),
      Categoria.find({}, "_id nombreCategoria").lean(),
      SubCategoria.find({}, "_id nombreSubCategoria").lean(),
      Utensilio.find({}, "_id nombreUtencilio").lean(),
    ]);

    // 2️⃣ Prompt del sistema (reglas estrictas)
    const systemPrompt = `
Eres un generador de recetas en formato JSON.

REGLAS OBLIGATORIAS:
- SOLO puedes usar los IDs proporcionados
- NO inventes ingredientes, medidas, categorías, subcategorías ni utensilios
- Si el ingrediente no existe reemplazar por uno que sie xista
- NO inventes IDs
- NO incluyas texto fuera del JSON
- Devuelve JSON válido
- Debe contener al menos 1 subcategoria
- Respeta EXACTAMENTE la estructura solicitada
- Las edidas deben tener sentido con el ingrediente

Si no puedes cumplir las reglas, responde SOLO:
{ "error": "No se puede generar la receta con los datos disponibles" }
`;

    // 3️⃣ Contexto con datos reales
    const dataPrompt = `
DIFICULTADES:
${JSON.stringify(dificultades, null, 2)}

CATEGORIAS:
${JSON.stringify(categorias, null, 2)}

SUBCATEGORIAS:
${JSON.stringify(subcategorias, null, 2)}

INGREDIENTES:
${JSON.stringify(ingredientes, null, 2)}

MEDIDAS:
${JSON.stringify(medidas, null, 2)}

UTENSILIOS:
${JSON.stringify(utensilios, null, 2)}
`;

    // 4️⃣ Prompt del usuario
    const userPrompt = `
Genera una receta con estas características:
${messages[0].content}

Devuelve SOLO el JSON con esta estructura EXACTA:

{
  "titulo": "",
  "descripcion": "",
  "hours": 0,
  "minutes": 0,
  "cantidadPersonas": 1,
  "dificultad": "",
  "categoria": "",
  "subCategoria": [],
  "grupoIngrediente": [
    {
      "nombreGrupo": "",
      "items": [
        {
          "medida": {
            "_id": "",
            "nombreMedida": ""
          },
          "ingrediente": {
            "_id": "",
            "nombreIngrediente": ""
          },
          "valor": "",
          "alternativas": []
        }
      ]
    }
  ],
  "utencilio": [],
  "pasos": [
    {
      "pasoNumero": 1,
      "descripcion": ""
    }
  ]
}
`;

    const finalMessages = [
      { role: "system", content: systemPrompt },
      { role: "system", content: dataPrompt },
      { role: "user", content: userPrompt },
    ];

    console.log("mi userprompt", userPrompt);


    // 5️⃣ Llamada a la IA
    const response = await client.chatCompletion({
      model: "openai/gpt-oss-120b",
      messages: finalMessages,
    });

    const content = response.choices[0].message.content;

    // 6️⃣ Parseo seguro
    let receta;
    try {
      receta = JSON.parse(content);
      console.log("mi receta", receta);

    } catch (err) {
      throw new Error("La IA devolvió un JSON inválido");
    }

    // 7️⃣ Validación mínima (defensiva)
    if (!receta.titulo || !receta.grupoIngrediente || !receta.pasos) {
      throw new Error("La receta generada no cumple el formato esperado");
    }

    return receta;

  } catch (error) {
    console.error("❌ Error generando receta IA:", error);
    throw error;
  }
};
