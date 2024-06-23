// models/Reaction.js
import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
  status: { type: Boolean },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  receta: { type: Schema.Types.ObjectId, ref: 'Recetas' },
  referencia_id: { type: Schema.Types.ObjectId, refPath: 'referenciaModelo' }, // referenciaModelo es un campo virtual que se utilizará para determinar si la referencia es para un Receta o un Comentario
  referenciaModelo: {
    type: String,
    enum: ['Receta', 'Comentario']
  }
});

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
