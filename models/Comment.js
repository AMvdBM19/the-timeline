const mongoose = require('mongoose');
const { Schema } = mongoose;

const commentSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
      minlength: [25, "Comment should be minimum 25 characters"]
    },
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true
    }
  },
  { timestamps: true }
);

const Comment = mongoose.model('Comment', commentSchema);
module.exports = Comment;
