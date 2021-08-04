/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
const Card = require('../models/card');

// eslint-disable-next-line import/order
const ObjectId = require('mongodb').ObjectID;

const NotFoundError = require('../errors/not-found-err');

const ERROR_CODE_BAD_REQUEST = 400;
const ERROR_CODE_NOT_FOUND = 404;
const ERROR_CODE_SERVER_ERROR = 500;

const getCards = (req, res, next) => {
  Card.find({})
    .then((card) => {
      if (card.length === 0) throw new NotFoundError('Карточек нет');
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.message === 'Карточек нет') next(new NotFoundError('Карточек нет'));
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

const deleteCards = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => {
      if (!card.owner.equals(req.user._id)) return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Нельзя удалить чужую карточку' });
      Card.findByIdAndRemove(req.params.cardId)
        .then((card) => res.send({ data: card }));
    })
    .catch((err) => {
      if (err.message === 'Карточка не найдена') next(new NotFoundError('Карточка не найдена'));
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
