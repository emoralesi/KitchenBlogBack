import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreIngrediente: { type: String, unique: true, maxlength: 250 }
});

const Ingrediente = mongoose.model('Ingrediente', reactionSchema);

export default Ingrediente;
