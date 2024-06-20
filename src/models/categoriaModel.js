import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreCategoria: { type: String }
});

const Categoria = mongoose.model('Categoria', reactionSchema);

export default Categoria;
