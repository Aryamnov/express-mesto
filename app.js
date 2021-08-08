const express = require('express');
require('dotenv').config();

const mongoose = require('mongoose');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { errors } = require('celebrate');
const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

const NotFoundError = require('./errors/not-found-err');

const auth = require('./middlewares/auth');

const { signInValidator, signUpValidator } = require('./middlewares/validation');

const {
  newUser, login,
} = require('./controllers/users');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

app.use(limiter);
app.use(helmet());
app.use('/', express.json());
app.post('/signin', signInValidator, login);
app.post('/signup', signUpValidator, newUser);
app.use(auth);
app.use('/', routerUser);
app.use('/', routerCard);
app.use('*', () => {
  throw new NotFoundError('Запрашиваемый ресурс не найден');
});
app.use(errors());
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  // eslint-disable-next-line no-console
  console.log(`App listening on port ${PORT}`);
});
