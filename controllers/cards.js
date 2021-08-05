/* eslint-disable consistent-return */
/* eslint-disable prefer-promise-reject-errors */
const Card = require('../models/card');

// eslint-disable-next-line import/order
const ObjectId = require('mongodb').ObjectID;

const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-err');
const ServerError = require('../errors/server-err');
const ForbiddenError = require('../errors/forbidden-err');

const getCards = (req, res, next) => {
  Card.find({})
    .then((card) => {
      if (card.length === 0) throw new NotFoundError('Карточек нет');
      res.send({ data: card });
    })
    .catch((err) => {
      if (err.message === 'Карточек нет') next(new NotFoundError('Карточек нет'));
      next(new ServerError('Произошла ошибка'));
    });
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = ObjectId(req.user._id);

  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === 'card validation failed') next(new BadRequestError('Переданы некорректные данные'));
      next(new ServerError('Произошла ошибка'));
    });
};

const deleteCards = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => {
      if (!card.owner.equals(req.user._id)) throw new ForbiddenError('Нельзя удалить чужую карточку');
      Card.findByIdAndRemove(req.params.cardId)
        // eslint-disable-next-line no-shadow
        .then((card) => res.send({ data: card }));
    })
    .catch((err) => {
      if (err.message === 'Нельзя удалить чужую карточку') next(new ForbiddenError('Нельзя удалить чужую карточку'));
      if (err.message === 'Карточка не найдена') next(new NotFoundError('Карточка не найдена'));
      // eslint-disable-next-line no-underscore-dangle
      if (err._message === undefined) next(new BadRequestError('Невалидный id'));
      next(new ServerError('Произошла ошибка'));
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequestError('Переданы некорректные данные'));
      if (err.message === 'Карточка не найдена') next(new NotFoundError('Карточка не найдена'));
      next(new ServerError('Произошла ошибка'));
    });
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail(() => {
      throw new NotFoundError('Карточка не найдена');
    })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'CastError') next(new BadRequestError('Переданы некорректные данные'));
      if (err.message === 'Карточка не найдена') next(new NotFoundError('Карточка не найдена'));
      next(new ServerError('Произошла ошибка'));
    });
};
module.exports = {
  getCards, createCard, deleteCards, likeCard, dislikeCard,
};
