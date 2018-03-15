var express =  require('express');

var router = express.Router();

// require controller modules
var api_controller = require('../controllers/apiController');

// Api call to GET books catalog home page.
router.get('/books', api_controller.books_get);

// Api call to GET books catalog home page.
router.get('/book/:id', api_controller.book_get_id);

// Api call to GET bookinstances catalog home page.
router.get('/bookinstances', api_controller.bookinstances_get);

// Api call to GET bookinstances catalog home page.
router.get('/bookinstance/:id', api_controller.bookinstance_get_id);

// Api call to GET genres catalog home page.
router.get('/genres', api_controller.genres_get);

// Api call to GET genres catalog home page.
router.get('/genre/:id', api_controller.genre_get_id);

// Api call to GET authors catalog home page.
router.get('/authors', api_controller.authors_get);

// Api call to GET authors catalog home page.
router.get('/author/:id', api_controller.author_get_id);

module.exports = router;