import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    pasoNumero: { type: Number },
    descripcion: { type: String, maxlength: 500 },
    imageStep: []
});

const Pasos = mongoose.model('Pasos', reactionSchema);

export default Pasos;
