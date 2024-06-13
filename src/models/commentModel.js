import mongoose, { Schema } from 'mongoose';

const commentSchema = new mongoose.Schema({
  content: String,
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  post: { type: Schema.Types.ObjectId, ref: 'Post' },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  parentComment: { type: Schema.Types.ObjectId, ref :'Comment' }
});

const Comment = mongoose.model('Comment', commentSchema);

export default Comment;
