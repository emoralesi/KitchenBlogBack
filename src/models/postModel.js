import mongoose, { Schema } from 'mongoose';

const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  user: { type: Schema.Types.ObjectId, ref: 'Usuario' },
  reactions: [{ type: Schema.Types.ObjectId, ref: 'Reaction' }],
  comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }]
});

const Post = mongoose.model('Post', postSchema);

export default Post;
