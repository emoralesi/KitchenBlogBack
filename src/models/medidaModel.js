import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreMedida: { type: String }
});

const Medida = mongoose.model('Medida', reactionSchema);

export default Medida;
