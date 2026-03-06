const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feedController');

// First landing page is /feed
router.get('/feed', feedController.listFeed);
router.post('/feed', feedController.createPost);

// Show one post
router.get('/feed/:id', feedController.showOne);

// Edit routes
router.get('/feed/edit/:id', feedController.showEditForm);
router.post('/feed/edit/:id', feedController.updatePost);

// Delete route
router.post('/feed/:id/delete', feedController.deletePost);

module.exports = router;

