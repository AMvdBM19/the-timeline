const Post = require('../models/Post');
const Comment = require('../models/Comment');
const mongoose = require('mongoose');

// ----- POST API -----

// GET all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: posts.length,
      data: posts
    });
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error loading posts'
    });
  }
};

// POST one post (create)
exports.postOnePost = async (req, res) => {
  try {
    const { post } = req.body;

    if (!post || typeof post !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required and must be a string'
      });
    }

    if (post.trim().length < 25) {
      return res.status(400).json({
        success: false,
        message: 'Post should be minimum 25 characters'
      });
    }

    const newPost = new Post({ post: post.trim() });
    await newPost.save();

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: newPost
    });
  } catch (error) {
    if (error.errors && error.errors.post) {
      return res.status(400).json({
        success: false,
        message: error.errors.post.properties?.message || 'Validation error'
      });
    }
    console.error('Error creating post:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating post'
    });
  }
};

// PUT one post (update)
exports.updateOnePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { post } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    if (!post || typeof post !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Post content is required and must be a string'
      });
    }

    if (post.trim().length < 25) {
      return res.status(400).json({
        success: false,
        message: 'Post should be minimum 25 characters'
      });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { post: post.trim() },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: updatedPost
    });
  } catch (error) {
    if (error.errors && error.errors.post) {
      return res.status(400).json({
        success: false,
        message: error.errors.post.properties?.message || 'Validation error'
      });
    }
    console.error('Error updating post:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error updating post'
    });
  }
};

// DELETE one post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Optionally delete all comments for this post
    await Comment.deleteMany({ postId: id });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
      data: deletedPost
    });
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting post'
    });
  }
};

// ----- COMMENT API -----

// GET all comments for a post
exports.getAllCommentsPost = async (req, res) => {
  try {
    const postId = req.params['id-post'];

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comments = await Comment.find({ postId }).sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      data: comments
    });
  } catch (error) {
    console.error('Error fetching comments:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error loading comments'
    });
  }
};

// POST one comment on a post
exports.postOneComment = async (req, res) => {
  try {
    const postId = req.params['id-post'];
    const { content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid post ID'
      });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (!content || typeof content !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required and must be a string'
      });
    }

    if (content.trim().length < 25) {
      return res.status(400).json({
        success: false,
        message: 'Comment should be minimum 25 characters'
      });
    }

    const newComment = new Comment({
      content: content.trim(),
      postId
    });
    await newComment.save();

    res.status(201).json({
      success: true,
      message: 'Comment created successfully',
      data: newComment
    });
  } catch (error) {
    if (error.errors && error.errors.content) {
      return res.status(400).json({
        success: false,
        message: error.errors.content.properties?.message || 'Validation error'
      });
    }
    console.error('Error creating comment:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating comment'
    });
  }
};
