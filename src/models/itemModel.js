import mongoose, { Schema } from "mongoose";

const reactionSchema = new mongoose.Schema({
  valor: { type: String, maxlength: 50, required: true },
  ingrediente: { type: Schema.Types.ObjectId, ref: "Ingrediente" },
  medida: { type: Schema.Types.ObjectId, ref: "Medida" },
  presentacion: { type: mongoose.Schema.Types.ObjectId, ref: "Presentacion" },
  alternativas: [
    {
      ingrediente: {
        type: Schema.Types.ObjectId,
        ref: "Ingrediente",
        required: true,
      },
    },
  ],
});

const Item = mongoose.model("Item", reactionSchema);

export default Item;
