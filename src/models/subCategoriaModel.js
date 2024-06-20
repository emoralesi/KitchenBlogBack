import mongoose from 'mongoose';

const reactionSchema = new mongoose.Schema({
    nombreSubCategoria: { type: String }
});

const SubCAtegoria = mongoose.model('SubCategoria', reactionSchema);

export default SubCAtegoria;
