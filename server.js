require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const methodOverride = require('express-method-override');  // NEW: For PUT/DELETE via HTML forms
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const apiRoutes = require('./routes/api');
const authController = require('./controllers/authController');
const { attachUser, requireAuth } = require('./middleware/auth');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(cookieParser());
app.use(attachUser);

// Auth pages
app.get('/login', authController.showLogin);
app.get('/register', authController.showRegister);
app.post('/register', authController.register);
app.post('/login', authController.login);
app.post('/logout', authController.logout);

// API routes (controller)
app.use(apiRoutes);

// Read all posts with their comments
app.get('/', async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    const postIds = posts.map((p) => p._id);
    const comments = await Comment.find({ postId: { $in: postIds } }).sort({ createdAt: 1 });
    const postsWithComments = posts.map((p) => ({
      ...p.toObject(),
      comments: comments.filter((c) => c.postId.toString() === p._id.toString())
    }));
    res.render('index', { posts: postsWithComments });
  } catch (error) {
    console.error('Error fetching posts:', error.message);
    res.status(500).send('Error loading posts');
  }
});

app.post('/posts', requireAuth, async (req, res) => {
  try {
    const { post } = req.body;

    if (!post) {
      return res.status(400).send('Post cannot be empty');
    }

    const newPost = new Post({
      post: post,
      userId: req.user.id,
      authorName: `${req.user.firstName} ${req.user.lastName}`
    });

    await newPost.save();

    res.redirect('/');
  } catch (error) {
    if (error.errors && error.errors.post && error.errors.post.properties) {
      const validationError = error.errors.post.properties.message;
      return res.status(400).send(`Validation Error: ${validationError}`);
    }
    console.error('Error creating post:', error.message);
    res.status(500).send('Error creating post');
  }
});

// Update a post
app.put('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { post } = req.body;

    if (!post) {
      return res.status(400).send('Post cannot be empty');
    }

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { post },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return res.status(404).send('Post not found');
    }

    res.redirect('/');
  } catch (error) {
    if (error.errors && error.errors.post && error.errors.post.properties) {
      const validationError = error.errors.post.properties.message;
      return res.status(400).send(`Validation Error: ${validationError}`);
    }
    console.error('Error updating post:', error.message);
    res.status(500).send('Error updating post');
  }
});

// Add comment to a post
app.post('/posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send('Post not found');
    }

    const newComment = new Comment({
      content,
      postId: id,
      userId: req.user.id,
      authorName: `${req.user.firstName} ${req.user.lastName}`
    });
    await newComment.save();
    res.redirect('/');
  } catch (error) {
    if (error.errors && error.errors.content && error.errors.content.properties) {
      const msg = error.errors.content.properties.message;
      return res.status(400).send(`Validation Error: ${msg}`);
    }
    console.error('Error creating comment:', error.message);
    res.status(500).send('Error creating comment');
  }
});

// Delete a post
app.delete('/posts/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPost = await Post.findByIdAndDelete(id);

    if (!deletedPost) {
      return res.status(404).send('Post not found');
    }

    res.redirect('/');
  } catch (error) {
    console.error('Error deleting post:', error.message);
    res.status(500).send('Error deleting post');
  }
});

//Mongo Db connection (use .env MONGODB_URI for Atlas, or localhost)
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/the-timeline';
mongoose.connect(mongoUri)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ MongoDB connected!`);
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  });