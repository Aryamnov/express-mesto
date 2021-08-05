const { celebrate, Joi } = require('celebrate');

const userValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    email: Joi.string().min(2).email(),
    password: Joi.string().min(8),
    about: Joi.string().min(2).max(30),
    avatar: Joi.string().min(6),
  }),
});

const cardValidator = celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    link: Joi.string().min(6),
  }),
});

module.exports = {
  userValidator, cardValidator,
};
