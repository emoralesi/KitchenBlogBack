import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    pasoNumero: { type: Number },
    descripcion: { type: String },
    images: []
});

const Pasos = mongoose.model('Pasos', reactionSchema);

export default Pasos;
