const FEED = require('../models/Feed');

// GET /feed - list all posts and show create form
exports.listFeed = async (req, res) => {
  try {
    const posts = await FEED.find().sort({ createdAt: -1 });
    res.render('feed-index', { posts, errors: null, old: {} });
  } catch (err) {
    console.error('Error loading feed list:', err.message);
    res.status(500).send('Error loading feed');
  }
};

// POST /feed - create a new post
exports.createPost = async (req, res) => {
  const { name, message } = req.body;

  const errors = [];
  if (!name || !message) {
    errors.push('All fields are required.');
  }
  if (name && name.trim().length > 15) {
    errors.push('Name must be no longer than 15 characters.');
  }
  if (message && message.trim().length > 40) {
    errors.push('Message must be no longer than 40 characters.');
  }

  if (errors.length > 0) {
    const posts = await FEED.find().sort({ createdAt: -1 });
    return res.status(400).render('feed-index', {
      posts,
      errors,
      old: { name, message }
    });
  }

  try {
    await FEED.create({
      name: name.trim(),
      message: message.trim()
    });
    res.redirect('/feed');
  } catch (err) {
    console.error('Error creating feed post:', err.message);
    const posts = await FEED.find().sort({ createdAt: -1 });
    const mongooseErrors = [];
    if (err.errors) {
      Object.values(err.errors).forEach((e) => mongooseErrors.push(e.message));
    }
    res.status(400).render('feed-index', {
      posts,
      errors: mongooseErrors.length ? mongooseErrors : ['Could not save post.'],
      old: { name, message }
    });
  }
};

// GET /feed/:id - show one post
exports.showOne = async (req, res) => {
  try {
    const post = await FEED.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('feed-show', { post });
  } catch (err) {
    console.error('Error loading single feed post:', err.message);
    res.status(500).send('Error loading post');
  }
};

// GET /feed/edit/:id - edit form
exports.showEditForm = async (req, res) => {
  try {
    const post = await FEED.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.render('feed-edit', { post, errors: null });
  } catch (err) {
    console.error('Error loading edit form:', err.message);
    res.status(500).send('Error loading edit form');
  }
};

// POST /feed/edit/:id - update post
exports.updatePost = async (req, res) => {
  const { name, message } = req.body;
  const errors = [];

  if (!name || !message) {
    errors.push('All fields are required.');
  }
  if (name && name.trim().length > 15) {
    errors.push('Name must be no longer than 15 characters.');
  }
  if (message && message.trim().length > 40) {
    errors.push('Message must be no longer than 40 characters.');
  }

  if (errors.length > 0) {
    const post = {
      _id: req.params.id,
      name,
      message
    };
    return res.status(400).render('feed-edit', { post, errors });
  }

  try {
    const updated = await FEED.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), message: message.trim() },
      { new: true, runValidators: true }
    );

    if (!updated) {
      return res.status(404).send('Post not found');
    }

    // After editing, go back to show-one page
    res.redirect(`/feed/${updated._id}`);
  } catch (err) {
    console.error('Error updating feed post:', err.message);
    const post = {
      _id: req.params.id,
      name,
      message
    };
    const mongooseErrors = [];
    if (err.errors) {
      Object.values(err.errors).forEach((e) => mongooseErrors.push(e.message));
    }
    res.status(400).render('feed-edit', {
      post,
      errors: mongooseErrors.length ? mongooseErrors : ['Could not update post.']
    });
  }
};

// POST /feed/:id/delete - delete post and go back to list
exports.deletePost = async (req, res) => {
  try {
    const deleted = await FEED.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).send('Post not found');
    }
    // After delete, navigate back to first page (/feed)
    res.redirect('/feed');
  } catch (err) {
    console.error('Error deleting feed post:', err.message);
    res.status(500).send('Error deleting post');
  }
};

