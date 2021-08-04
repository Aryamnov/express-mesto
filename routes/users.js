const router = require('express').Router();

const {
  getUsers, getUserId, patchUser, patchAvatar, getMeInfo,
} = require('../controllers/users');

router.get('/users', getUsers);
router.get('/users/me', getMeInfo);
router.get('/users/:userId', getUserId);
router.patch('/users/me', patchUser);
router.patch('/users/me/avatar', patchAvatar);

module.exports = router;
