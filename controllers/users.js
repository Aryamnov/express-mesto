/* eslint-disable consistent-return */
const User = require('../models/user');

const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

const getUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' }));
};

const getUserId = (req, res) => {
  User.find({})
    .then((users) => users.find((user) => user.id === req.params.userId))
    .then((user) => {
      // eslint-disable-next-line prefer-promise-reject-errors
      if (user === undefined) return Promise.reject('Пользователь не найден');
      res.send({ data: user });
    })
    .catch((err) => {
      if (err === 'Пользователь не найден') res.status(ERROR_CODE_NOT_FOUND).send({ message: err });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка', err });
    });
};

const newUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      if (err._message === 'user validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const patchUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about },
    { new: true, runValidators: true, upsert: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err._message === 'Validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const patchAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true, runValidators: true, upsert: true })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      if (err._message === 'Validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports = {
  getUsers, getUserId, newUser, patchUser, patchAvatar,
};
