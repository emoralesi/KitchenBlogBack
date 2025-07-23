import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreCategoria: { type: String, unique: true }
});

const Categoria = mongoose.model('Categoria', reactionSchema);

export default Categoria;
