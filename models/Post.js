const mongoose = require('mongoose');
const { Schema } = mongoose;


const postSchema = new Schema(
  {
    post: {
      type: String,
      required: true,
      minlength: [25, "Post should be minimum 25 characters"]
    }
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

//Export schema to be used in server.js
module.exports = Post;
