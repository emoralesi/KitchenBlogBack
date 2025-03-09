import mongoose, { Schema } from 'mongoose';

const recetaSchema = new mongoose.Schema({
  titulo: {
    type: String,
    maxlength: 50
  },
  descripcion: {
    type: String,
    maxlength: 250
  },
  images: [],
  hours: {
    type: Number,
    default: 0
  },
  minutes: {
    type: Number,
    default: 0
  },
  cantidadPersonas: Number,
  dificultad: { type: Schema.Types.ObjectId, ref: 'Dificultad' },
  categoria: { type: Schema.Types.ObjectId, ref: 'Categoria' },
  grupoIngrediente: [{ type: Schema.Types.ObjectId, ref: 'GrupoIngrediente' }],
  utencilio: [{ type: Schema.Types.ObjectId, ref: 'Utencilio' }],
  subCategoria: [{ type: Schema.Types.ObjectId, ref: 'SubCategoria' }],
  user: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  pasos: [{ type: Schema.Types.ObjectId, ref: 'Pasos' }],
  user: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  favourite: [{ type: Schema.Types.ObjectId, ref: 'Usuario' }],
  pined: Boolean,
  fechaReceta: {
    type: Date,
    default: Date.now
  },
  active: Boolean
});


const Receta = mongoose.model('Receta', recetaSchema);

export default Receta;