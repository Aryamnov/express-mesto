const express = require('express');

const mongoose = require('mongoose');

const routerUser = require('./routes/users');
const routerCard = require('./routes/cards');

const { PORT = 3000 } = process.env;

const app = express();

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.use('/', express.json());
app.use((req, res, next) => {
  req.user = {
    _id: '60efbc16e5c55228c41a6d98',
  };

  next();
});
app.use('/', routerUser);
app.use('/', routerCard);

app.listen(PORT, () => {
  // Если всё работает, консоль покажет, какой порт приложение слушает
  console.log(`App listening on port ${PORT}`);
});
