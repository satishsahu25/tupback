const express = require('express');
const deleteUser = require('../controllers/user.controller.js').deleteUser;
const getUser = require('../controllers/user.controller.js').getUser;
const getUsers = require('../controllers/user.controller.js').getUsers;
const signout = require('../controllers/user.controller.js').signout;
const test = require('../controllers/user.controller.js').test;
const updateUser = require('../controllers/user.controller.js').updateUser;
const verifyToken = require('../utils/verifyUser.js').verifyToken;


const router = express.Router();

router.get('/test', test);
router.put('/update/:userId', verifyToken, updateUser);
router.delete('/delete/:userId', verifyToken, deleteUser);
router.post('/signout', signout);
router.get('/getusers', verifyToken, getUsers);
router.get('/:userId', getUser);

module.exports = router;