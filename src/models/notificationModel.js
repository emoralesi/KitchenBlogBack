import mongoose, { Schema } from 'mongoose';

const notificationSchema = new mongoose.Schema({
  readed: Boolean,
  user_notificated: { type: Schema.Types.ObjectId, ref: 'User' },
  user_action: { type: Schema.Types.ObjectId, ref: 'User' },
  reference_id: { type: Schema.Types.ObjectId }, // referenciaModelo es un campo virtual que se utilizará para determinar si la referencia es para un Receta o un Comentario
  referenceModelo: {
    type: String,
    enum: ['Reaction', 'Comentario']
  },
  action: {
    type: String,
    enum: ['commentToReceta', 'commentToAnswerd', 'likeToReceta', 'likeToComment', 'likeToAnswerd']
  },
  fecha_notificacion: {
    type: Date,
    default: Date.now
  }
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
