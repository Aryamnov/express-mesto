/* eslint-disable consistent-return */
const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ServerError = require('../errors/server-err');
const UnauthorizedError = require('../errors/unauthorized-err');
const RegistrationError = require('../errors/registration-err');

const { JWT_SECRET = 'secret-key-dev' } = process.env;

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неправильные почта или пароль');
      }

      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        // хеши не совпали — отклоняем промис
        throw new UnauthorizedError('Неправильные почта или пароль');
      }
      User.findOne({ email })
        .then((user) => res.send({ token: jwt.sign({ _id: user._id }, JWT_SECRET, { expiresIn: '7d' }) }))
        .catch(() => next(new ServerError('Произошла ошибка')));
    })
    .catch(() => { next(new UnauthorizedError('Неправильные почта или пароль')); });
};

const getUsers = (req, res, next) => {
  User.find({})
    .then((user) => res.send({ data: user }))
    .catch(() => next(new ServerError('Произошла ошибка')));
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
      if (err.name === 'CastError') next(new BadRequestError('Переданы некорректные данные'));
      if (err.message === 'Пользователь не найден') next(new NotFoundError('Пользователь не найден'));
      next(new ServerError('Произошла ошибка'));
    });
};

const getMeInfo = (req, res, next) => {
  const { _id } = req.user;
  User.findOne({ _id })
    .then((user) => {
      if (user) res.send({ data: user });
    })
    .catch(() => next(new ServerError('Произошла ошибка')));
};

const newUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  if (!validator.isEmail(email)) throw new BadRequestError('Переданы некорректные данные');

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      const { _id } = user;
      User.find({ _id })
        // eslint-disable-next-line no-shadow
        .then((user) => res.status(201).send({ data: user }));
    })
    .catch((err) => {
      if (err.name === 'MongoError' && err.code === 11000) {
        next(new RegistrationError('Такой пользователь уже существует'));
      }
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'user validation failed') next(new BadRequestError('Переданы некорректные данные'));
      next(new ServerError('Произошла ошибка'));
    });
};

const patchUser = (req, res, next) => {
  const { name, about } = req.body;

  User.findByIdAndUpdate(req.user._id, { name, about },
    { new: true, runValidators: true, upsert: false })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'Validation failed') throw new BadRequestError('Переданы некорректные данные');
      next(new ServerError('Произошла ошибка'));
    });
};

const patchAvatar = (req, res, next) => {
  const { avatar } = req.body;

  User.findByIdAndUpdate(req.user._id, { avatar },
    { new: true, runValidators: true, upsert: false })
    .then((user) => res.send({ data: user }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'Validation failed') next(new BadRequestError('Переданы некорректные данные'));
      next(new ServerError('Произошла ошибка'));
    });
};

module.exports = {
  getUsers, getUserId, newUser, patchUser, patchAvatar, login, getMeInfo,
};
