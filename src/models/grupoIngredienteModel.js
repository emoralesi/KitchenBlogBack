import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreGrupo: { type: String, maxlength: 250 },
    item: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
});

const GrupoIngrediente = mongoose.model('GrupoIngrediente', reactionSchema);

export default GrupoIngrediente;
