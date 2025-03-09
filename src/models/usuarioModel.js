import mongoose, { Schema } from 'mongoose';

const usuarioSchema = new mongoose.Schema({
    email: { type: String, unique: true, require: true },
    username: { type: String, unique: true, require: true },
    favourite: [{ type: Schema.Types.ObjectId, ref: 'Receta' }],
    password: { type: String, unique: true, require: true, maxlength: 250 },
    profileImageUrl: { type: String }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);

export default Usuario;