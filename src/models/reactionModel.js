// models/Reaction.js
import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
  status: { type: Boolean },
  user_id: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  referencia_id: { type: Schema.Types.ObjectId, refPath: 'referenciaModelo' }, // referenciaModelo es un campo virtual que se utilizará para determinar si la referencia es para un Post o un Comentario
  referenciaModelo: {
    type: String,
    enum: ['Post', 'Comentario']
  }
});

const Reaction = mongoose.model('Reaction', reactionSchema);

export default Reaction;
