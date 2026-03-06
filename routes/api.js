const express = require('express');
const router = express.Router();
const controller = require('../controllers/postController');

// Post API
router.get('/api/get-posts', controller.getAllPosts);
router.post('/api/create-post', controller.postOnePost);
router.put('/api/edit-post/:id', controller.updateOnePost);
router.delete('/api/delete-post/:id', controller.deletePost);

// Comment Post API
router.get('/api/get-post-comments/:id-post', controller.getAllCommentsPost);
router.post('/api/post-post-comment/:id-post', controller.postOneComment);

module.exports = router;
