import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    valor: { type: Number, require: true, },
    ingrediente: { type: Schema.Types.ObjectId, ref: 'Ingrediente' },
    medida: { type: Schema.Types.ObjectId, ref: 'Medida' },
});

const Item = mongoose.model('Item', reactionSchema);

export default Item;
