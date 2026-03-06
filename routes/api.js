const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');
const { requireAuth } = require('../middleware/auth');

// Post API
router.get('/api/get-posts', controller.getAllPosts);
router.post('/api/create-post', requireAuth, controller.postOnePost);
router.put('/api/edit-post/:id', requireAuth, controller.updateOnePost);
router.delete('/api/delete-post/:id', requireAuth, controller.deletePost);

// Comment Post API
router.get('/api/get-post-comments/:id-post', controller.getAllCommentsPost);
router.post('/api/post-post-comment/:id-post', requireAuth, controller.postOneComment);

module.exports = router;
