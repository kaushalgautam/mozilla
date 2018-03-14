var Genre = require('../models/genre');
var Book = require('../models/book');
var async = require('async');
const { body, validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

// Display list of all Genre.
exports.genre_list = function(req, res) {
    Genre.find()
    .exec(function(err, list_genre) {
        if(err) return next(err);
        res.render('genre_list', {title: 'Genre List', genre_list: list_genre});
    })
};

// Display detail page for a specific Genre.
exports.genre_detail = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id)
            .exec(callback);
        },
        genre_books: function(callback) {
            Book.find({ 'genre': req.params.id })
            .exec(callback);
        },
    }, function(err, result){
        if(err) {
            return next(err);
        }
        else if(result.genre == null) { // No results
            var err = new Error('Genre Not Found');
            err.status = 404;
            return next(err);
        }
        console.log(result);
        // Successful, so render
        res.render('genre_detail', {title: 'Genre Details', genre: result.genre, genre_books: result.genre_books})
    }
    )
    
};

// Display Genre create form on GET.
exports.genre_create_get = function(req, res) {
    res.render('genre_form', {title: 'Create Genre'});
};

// Handle Genre create on POST.
exports.genre_create_post = [
    // validate that the name field is not empty
    body('name', 'Genre name required').isLength({min : 1}).trim(),
    
    // sanitize (trim and escape) the name field
    sanitizeBody('name').trim().escape(),
    
    // process request after validation and sanitization
    (req, res, next) => {
        
        // extract the validation errors from a request.
        const errors = validationResult(req);
        
        // create a genre object with escaped and trimmed data
        var genre = new Genre(
            {name: req.body.name}
        );
        
        if(!errors.isEmpty()) {
            // there are errors. render the form again with sanitized values/error messages
            res.render('genre_form', {title: 'Create Genre', genre: genre, errors: errors.array()});
            return;
        }
        else {
            // Data from the form is valid
            // check if genre with the same name already exists
            Genre.findOne({'name': req.body.name})
            .exec(function(err, found_genre) {
                if(err) {return next(err); }
                if(found_genre) {
                    //genre exists, redirect to its detail page
                    res.redirect(found_genre.url);
                }
                else {
                    genre.save(function(err) {
                        if(err) {return next(err); }
                        // genre saved, redirect to the new genre's page:
                        res.redirect(genre.url);
                    });
                }
            });
            
        }
    }
];

// Display Genre delete form on GET.
exports.genre_delete_get = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.params.id).exec(callback)
        },
        books: function(callback) {
            Book.find({'genre': req.params.id}).exec(callback)
        }
    }, function(err, results) {
       if(err) {return next(err); }
       if(results.genre == null) {
           res.redirect('catalog/genres');
       }
       // successful so render
       res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, books: results.books});
    });
};

// Handle Genre delete on POST.
exports.genre_delete_post = function(req, res, next) {
    async.parallel({
        genre: function(callback) {
            Genre.findById(req.body.bookid).exec(callback)
        },
        books: function(callback) {
            Book.find({'genre': req.body.genreid}).exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        if(results.books.length > 0) {
            // genre has no books so  render the same way as for the get
            res.render('genre_delete', {title: 'Delete Genre', genre: results.genre, books: results.books});
        }
        else {
            // Genre has no books so delete the book and redirect to the list page
            Genre.findByIdAndRemove(req.body.genreid, function deleteGenre(err) {
                if(err) {return next(err)};
                // success - go to the author page: 
                res.redirect('/catalog/genres');
            })
        }
    }
    
    )
};

// Display Genre update form on GET.
exports.genre_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update GET');
};

// Handle Genre update on POST.
exports.genre_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Genre update POST');
};