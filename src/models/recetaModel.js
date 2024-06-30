import mongoose, { Schema } from 'mongoose';

const recetaSchema = new mongoose.Schema({
  titulo: String,
  descripcion: String,
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
  reactions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  pasos: [{ type: Schema.Types.ObjectId, ref: 'Pasos' }],
  user: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  fechaReceta: {
    type: Date,
    default: Date.now
  }
});

// Método para obtener la duración formateada
// recetaSchema.methods.getFormattedDuration = function() {
//   const totalMinutes = (this.hours * 60) + this.minutes;
//   const h = Math.floor(totalMinutes / 60);
//   const m = totalMinutes % 60;
//   return h > 0 ? `${h}h ${m}min` : `${m}min`;
// };

const Receta = mongoose.model('Receta', recetaSchema);

export default Receta;