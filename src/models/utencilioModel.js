import mongoose, { Schema } from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreUtencilio: { type: String }
});

const Utencilio = mongoose.model('Utencilio', reactionSchema);

export default Utencilio;
