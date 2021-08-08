const { celebrate } = require('celebrate');
const Joi = require('joi-oid');

const regex = /^http[s]?:\/\/(www\.)?[A-Za-z0-9-._~:/?#[\]@!$&'()*+,;=]*\.[A-Za-z]{2}/; // регулярное выражение для ссылок

const signInValidator = celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().min(2).email(),
    password: Joi.string().required().min(8),
  }),
});

const signUpValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().required().min(2).email(),
    password: Joi.string().required().min(8),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().pattern(regex),
  }).unknown(true),
});

const userIdValidator = celebrate({
  params: Joi.object().keys({
    userId: Joi.objectId(),
  }),
});

const patchUserValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }).unknown(true),
});

const patchAvatarValidator = celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().required().pattern(regex),
  }).unknown(true),
});

const cardIdValidator = celebrate({
  params: Joi.object().keys({
    cardId: Joi.objectId(),
  }),
});

const createCardValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(regex),
  }).unknown(true),
});

module.exports = {
  signInValidator,
  signUpValidator,
  userIdValidator,
  patchUserValidator,
  patchAvatarValidator,
  cardIdValidator,
  createCardValidator,
};
