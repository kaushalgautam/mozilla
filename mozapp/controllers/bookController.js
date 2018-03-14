var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var mongoose = require('mongoose');
var async = require('async');

const { body,validationResult } = require('express-validator/check');
const { sanitizeBody } = require('express-validator/filter');

exports.index = function(req, res, next) {
    async.parallel({
        book_count: function(callback) {
            Book.count(callback);
        },
        book_instance_count: function(callback) {
            BookInstance.count(callback);
        },
        book_instance_available_count: function(callback) {
            BookInstance.count({status:'Available'}, callback);
        },
        author_count: function(callback) {
            Author.count(callback);
        },
        genre_count: function(callback) {
            Genre.count(callback);
        },
    }, function(err, results) {
        res.render('index', { title: 'Local Library Home', error: err, data: results });
    });
};

// Display list of all books.
exports.book_list = function(req, res, next) {
    Book.find({}, 'title author')
    .populate('author')
    .exec(function(err, list_books) {
       if(err) {
           return next(err);
       }
       res.render('book_list', {title: 'Book List', book_list: list_books});
    });
};

// Display detail page for a specific book.
exports.book_detail = function(req, res, next) {
    
    async.parallel({
        book: function(callback){
            Book.findById(req.params.id)
            .populate('author')
            .populate('genre')
            .exec(callback);
        },
        book_instance: function(callback) {
            BookInstance.find({'book': req.params.id})
            .exec(callback);
        },
    }, function(err, results) {
            if(err) {
                return next(err); 
            }
            if(results.book == null) {
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            res.render('book_detail', {title: 'Title', book: results.book, book_instances: results.book_instance});
        }
    );
};

// Display book create form on GET.
exports.book_create_get = function(req, res) {
    
    // Get all authors and genres, which we can use for adding to our book
    async.parallel({
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
    }, function(err, results) {
        if(err) {return next(err); }
        res.render('book_form',  {title: 'Create Book', authors: results.authors, genres: results.genres});
    })
};

// Handle book create on POST.
exports.book_create_post = [
    // Handles the post requests
    function(req, res, next) {
        if(!(req.body.genre instanceof Array)) {
            if(typeof req.body.genre === 'undefined') {
                req.body.genre =[];
            }
            else {
                req.body.genre = new Array(req.body.genre);
            }
        }
        next();
    },
    
    // Validate fields
    body('title', 'Title must not be empty. ').isLength({min: 1}).trim(),
    body('author', 'Author name must not be empty. ').isLength({min: 1}).trim(),
    body('summary', 'Summary must not be empty. ').isLength({min: 1}).trim(),
    body('isbn', 'ISBN must not be empty').isLength({min: 1}).trim(),
    
    // Sanitize fields (using wildcards)
    sanitizeBody('*').trim().escape(),
    
    // Process request after validation and sanitization
    function(req, res, next) {
        
          
      // extract the errors from the validation
      const errors = validationResult(req);
      
      // create a book object with escaped and trimmed data
      var book = new Book({
          title: req.body.title,
          author: req.body.author,
          summary: req.body.summary,
          isbn: req.body.isbn,
          genre: req.body.genre
      });
      
      if(!errors.isEmpty()) {
          console.log('haha');
          // there are errors, render again with sanitized values
          
          // get all authors and genres for form
          async.parallel({
              authors: function(callback) {
                  Author.find(callback);
              },
              genres: function(callback) {
                  Genre.find(callback);
              }
          }, function(err, results){
              if(err) {
                  return next(err); 
              }
              // Mark our selected genres as checked.
              for(let i = 0; i < results.genres.length; i++) {
                  if(book.genre.indexOf(results.genre[i]._id) > -1) {
                      results.genres[i].checked='true';
                  }
              }
              console.log('haha');
              res.render('book_form', {title: 'Create a book', authors: results.authors, genres: results.genres, book: book, errors: errors.array()});
            });
        return;
      }
      else {
          // Data from the form is valid, save book
          book.save(function(err) {
            if(err) {return next(err)}
            // successful so render
            res.redirect(book.url);    
          });
      }
    }
];

// Display book delete form on GET.
exports.book_delete_get = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).exec(callback)
        },
        bookinstances: function(callback) {
            BookInstance.find({'book': req.params.id}).exec(callback)
        }
    }, function(err, results) {
       if(err) {return next(err); }
       if(results.book == null) {
           res.redirect('catalog/books');
       }
       // successful so render
       res.render('book_delete', {title: 'Delete Book', book: results.book, bookinstances: results.bookinstances});
    });
};

// Handle book delete on POST.
exports.book_delete_post = function(req, res, next) {
    async.parallel({
        book: function(callback) {
            Book.findById(req.body.bookid).exec(callback)
        },
        bookinstances: function(callback) {
            BookInstance.find({'book': req.body.bookid}).exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        if(results.bookinstances.length > 0) {
            // Book has no bookinstances so  render the same way as for the get
            res.render('book_delete', {title: 'Delete Book', book: results.book, bookinstances: results.bookinstances});
        }
        else {
            // Book has no bookinstances so delete the book and redirect to the list page
            Book.findByIdAndRemove(req.body.bookid, function deleteBook(err) {
                if(err) {return next(err)};
                // success - go to the author page: 
                res.redirect('/catalog/books');
            })
        }
    }
    
    )
    
};

// Display book update form on GET.
exports.book_update_get = function(req, res, next) {
    // Get book, authors and genres for form.
    async.parallel({
        book: function(callback) {
            Book.findById(req.params.id).populate('author').populate('genre').exec(callback);
        },
        authors: function(callback) {
            Author.find(callback);
        },
        genres: function(callback) {
            Genre.find(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.book==null) { // No results.
                var err = new Error('Book not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            // Mark our selected genres as checked.
            for (var all_g_iter = 0; all_g_iter < results.genres.length; all_g_iter++) {
                for (var book_g_iter = 0; book_g_iter < results.book.genre.length; book_g_iter++) {
                    if (results.genres[all_g_iter]._id.toString()==results.book.genre[book_g_iter]._id.toString()) {
                        results.genres[all_g_iter].checked='true';
                    }
                }
            }
            res.render('book_form', { title: 'Update Book', authors:results.authors, genres:results.genres, book: results.book });
        });
};

// Handle book update on POST.
exports.book_update_post = [

    // Convert the genre to an array
    (req, res, next) => {
        if(!(req.body.genre instanceof Array)){
            if(typeof req.body.genre==='undefined')
            req.body.genre=[];
            else
            req.body.genre=new Array(req.body.genre);
        }
        next();
    },
   
    // Validate fields.
    body('title', 'Title must not be empty.').isLength({ min: 1 }).trim(),
    body('author', 'Author must not be empty.').isLength({ min: 1 }).trim(),
    body('summary', 'Summary must not be empty.').isLength({ min: 1 }).trim(),
    body('isbn', 'ISBN must not be empty').isLength({ min: 1 }).trim(),

    // Sanitize fields.
    sanitizeBody('title').trim().escape(),
    sanitizeBody('author').trim().escape(),
    sanitizeBody('summary').trim().escape(),
    sanitizeBody('isbn').trim().escape(),
    sanitizeBody('genre.*').trim().escape(),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        // Create a Book object with escaped/trimmed data and old id.
        var book = new Book(
          { title: req.body.title,
            author: req.body.author,
            summary: req.body.summary,
            isbn: req.body.isbn,
            genre: (typeof req.body.genre==='undefined') ? [] : req.body.genre,
            _id:req.params.id //This is required, or a new ID will be assigned!
           });

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/error messages.

            // Get all authors and genres for form.
            async.parallel({
                authors: function(callback) {
                    Author.find(callback);
                },
                genres: function(callback) {
                    Genre.find(callback);
                },
            }, function(err, results) {
                if (err) { return next(err); }

                // Mark our selected genres as checked.
                for (let i = 0; i < results.genres.length; i++) {
                    if (book.genre.indexOf(results.genres[i]._id) > -1) {
                        results.genres[i].checked='true';
                    }
                }
                res.render('book_form', { title: 'Update Book',authors:results.authors, genres:results.genres, book: book, errors: errors.array() });
            });
            return;
        }
        else {
            // Data from form is valid. Update the record.
            Book.findByIdAndUpdate(req.params.id, book, {}, function (err,thebook) {
                if (err) { return next(err); }
                   // Successful - redirect to book detail page.
                   res.redirect(thebook.url);
                });
        }
    }
];