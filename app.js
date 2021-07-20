const express = require('express');

const mongoose = require('mongoose');

const helmet = require('helmet');
const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use(helmet());
app.use('/', express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '60efbc16e5c55228c41a6d98',
  };

  next();
});
app.use('/', routerUser);
app.use('/', routerCard);
app.use('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
