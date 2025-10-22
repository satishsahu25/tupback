const express = require('express');
const verifyToken = require('../utils/verifyUser.js').verifyToken;
const createComment = require('../controllers/comment.controller.js').createComment;
const deleteComment = require('../controllers/comment.controller.js').deleteComment;
const editComment = require('../controllers/comment.controller.js').editComment;
const getPostComments = require('../controllers/comment.controller.js').getPostComments;
const getcomments = require('../controllers/comment.controller.js').getcomments;
const likeComment = require('../controllers/comment.controller.js').likeComment;


const router = express.Router();

router.post('/create', verifyToken, createComment);
router.get('/getPostComments/:postId', getPostComments);
router.put('/likeComment/:commentId', verifyToken, likeComment);
router.put('/editComment/:commentId', verifyToken, editComment);
router.delete('/deleteComment/:commentId', verifyToken, deleteComment);
router.get('/getcomments', verifyToken, getcomments);
module.exports = router;