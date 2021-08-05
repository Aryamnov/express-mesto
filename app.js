const express = require('express');

const mongoose = require('mongoose');

const helmet = require('helmet');
const { errors } = require('celebrate');
const { userValidator, cardValidator } = require('./middlewares/validation');
const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

const auth = require('./middlewares/auth');

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

app.use(helmet());
app.use('/', express.json());
/* app.use((req, res, next) => {
  req.user = {
    _id: '60efbc16e5c55228c41a6d98',
  };

  next();
}); */
app.post('/signin', login);
app.post('/signup', newUser);
app.use(auth);
app.use('/', userValidator, routerUser);
app.use('/', cardValidator, routerCard);
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});
app.use(errors());
app.use((err, req, res) => {
  res.status(err.statusCode).send({ message: err.message });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
