const router = require('express').Router();

const {
  getUsers, getUserId, patchUser, patchAvatar, getMeInfo,
} = require('../controllers/users');

const { userIdValidator, patchUserValidator, patchAvatarValidator } = require('../middlewares/validation');

router.get('/users', getUsers);
router.get('/users/me', getMeInfo);
router.get('/users/:userId', userIdValidator, getUserId);
router.patch('/users/me', patchUserValidator, patchUser);
router.patch('/users/me/avatar', patchAvatarValidator, patchAvatar);

module.exports = router;
