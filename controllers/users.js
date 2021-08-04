/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');

const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

const login = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        // хеши не совпали — отклоняем промис
        return Promise.reject(new Error('Неправильные почта или пароль'));
      }
      User.findOne({ email })
        .then((user) => res.send({ token: jwt.sign({ _id: user._id }, 'secret-key-dev', { expiresIn: '7d' }) }))
        .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' }));
    })
    .catch((err) => {
      res
        .status(401)
        .send({ message: err.message });
    });
};

const getUsers = (req, res) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' }));
};

const getUserId = (req, res, next) => {
  User.find({ _id: req.params.userId })
    .orFail(() => {
      throw new NotFoundError('Пользователь не найден');
    })
    .then((users) => users.find((user) => user.id === req.params.userId))
    .then((user) => {
      res.send({ data: user });
    })
    .catch((err) => {
      if (err.name === 'CastError') res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Введены некорректные данные' });
      if (err.message === 'Пользователь не найден') next(new NotFoundError('Пользователь не найден'));
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка', err });
    });
};

const getMeInfo = (req, res) => {
  const { _id } = req.user;
  console.log(_id);
  User.findOne({ _id })
    .then((user) => {
      if (user) res.send({ data: user });
    })
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' }));
};

const newUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!validator.isEmail(email)) return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });

  User.findOne({ email })
    .then((user) => {
      if (user) return res.status(409).send({ message: 'Такой пользователь уже существует' });
    })
    .catch(() => res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' }));

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.status(201).send({ data: user }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'user validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const patchUser = (req, res) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about },
    { new: true, runValidators: true, upsert: false })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'Validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const patchAvatar = (req, res) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar },
    { new: true, runValidators: true, upsert: false })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'Validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

module.exports = {
  getUsers, getUserId, newUser, patchUser, patchAvatar, login, getMeInfo,
};
