const router = require('express').Router();

const {
  getCards, createCard, deleteCards, likeCard, dislikeCard,
} = require('../controllers/cards');

const { cardIdValidator, createCardValidator } = require('../middlewares/validation');

router.get('/cards', getCards);
router.delete('/cards/:cardId', cardIdValidator, deleteCards);
router.post('/cards', createCardValidator, createCard);
router.put('/cards/:cardId/likes', cardIdValidator, likeCard);
router.delete('/cards/:cardId/likes', cardIdValidator, dislikeCard);

module.exports = router;
