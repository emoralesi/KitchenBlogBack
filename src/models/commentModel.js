import mongoose, { Schema } from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    maxlength: 250
  },
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  receta: { type: Schema.Types.ObjectId, ref: 'Receta' },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  parentComment: { type: Schema.Types.ObjectId, ref: 'Comment' }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
