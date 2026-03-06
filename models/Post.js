const mongoose = require('mongoose');
const { Schema } = mongoose;

const postSchema = new Schema(
  {
    post: {
      type: String,
      required: true,
      minlength: [25, 'Post should be minimum 25 characters']
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    authorName: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = Post;

