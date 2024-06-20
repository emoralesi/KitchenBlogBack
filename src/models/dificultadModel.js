import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreDificultad: { type: String }
});

const Dificultad = mongoose.model('Dificultad', reactionSchema);

export default Dificultad;
