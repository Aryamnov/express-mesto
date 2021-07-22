/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
const Card = require('../models/card');

// eslint-disable-next-line import/order
const ObjectId = require('mongodb').ObjectID;

const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

const getCards = (req, res) => {
  Card.find({})
    .then((card) => {
      if (card.length === 0) return Promise.reject('Карточек нет');
      res.send({ data: card });
    })
    .catch((err) => {
      if (err === 'Карточек нет') res.status(ERROR_CODE_NOT_FOUND).send({ message: err });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = ObjectId(req.user._id);

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'card validation failed') return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const deleteCards = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail(new Error('Карточка не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.message === 'Карточка не найдена') res.status(ERROR_CODE_NOT_FOUND).send({ message: err.message });
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === undefined) return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Невалидный id' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(new Error('Карточка не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Введены некорректные данные' });
      if (err.message === 'Карточка не найдена') res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка не найдена' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(new Error('Карточка не найдена'))
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Введены некорректные данные' });
      if (err.message === 'Карточка не найдена') res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Карточка не найдена' });
      res.status(ERROR_CODE_SERVER_ERROR).send({ message: 'Произошла ошибка' });
    });
};
module.exports = {
  getCards, createCard, deleteCards, likeCard, dislikeCard,
};
