import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreIngrediente: { type: String, unique: true }
});

const Ingrediente = mongoose.model('Ingrediente', reactionSchema);

export default Ingrediente;
