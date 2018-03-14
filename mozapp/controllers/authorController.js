var Author = require('../models/author');
var Book = require('../models/book');
var async = require('async');
const {body, validationResult} = require('express-validator/check');
const {sanitizeBody} = require('express-validator/filter');

// Display list of all Authors.
exports.author_list = function(req, res) {
    Author.find()
    .sort([['family_name', 'ascending']])
    .exec(function(err, list_authors) {
        if(err) { return next(err)}
        res.render('author_list', {title: 'Author List', author_list: list_authors});
    });
};
// Display detail page for a specific Author.
exports.author_detail = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id)
            .exec(callback)
        },
        author_books: function(callback) {
            Book.find({'author': req.params.id}, 'title summary')
            .exec(callback)
        }
    }, function(err, results){
        if(err) {return next(err); }
        if(results.author == null) {
            var err = new Error('Author not found');
            err.status = 404;
            return next(err);
        }
        res.render('author_detail', {title: 'Author Details', author: results.author, author_books: results.author_books} );
    });
};

// Display Author create form on GET.
exports.author_create_get = function(req, res) {
    res.render('author_form', {title: 'Create Author'});
};

// Handle Author create on POST.
exports.author_create_post = [
    // validate the fields
    body('first_name').isLength({min: 1}).trim().withMessage('First name must be specified.'),
    body('family_name').isLength({min: 1}).trim().withMessage('Family name must be specified.').isAlphanumeric().withMessage('Family name has non-alphanumeric characters!'),
    body('date_of_birth', 'Invalid date of birth').optional({checkFalsy: true}).isISO8601(),
    body('date_of_death', 'Invalid date of death').optional({checkFalsy: true}).isISO8601(),
    
    // sanitize the fields
    sanitizeBody('first_name').trim().escape(),
    sanitizeBody('family_name').trim().escape(),
    sanitizeBody('date_of_birth').toDate(),
    sanitizeBody('date_of_death').toDate(),
    
    // process request after validation and sanitization.
    (req, res, next) => {
        // extract the validation errors from the request
        const errors = validationResult(req);
        
        if(!errors.isEmpty()) {
            // there are errors, render the form again with sanitized values/error messages
            res.render('author_form', {title: 'Create Author', author: req.body, errors: errors.array()});
            return;
        }
        else {
            // Data from the from is valid
            
            // create an author object with the escaped data from the form
            var author = new Author( {
                first_name: req.body.first_name,
                family_name: req.body.family_name,
                date_of_birth: req.body.date_of_birth,
                date_of_death: req.body.date_of_death
            });
            
            author.save(function (err) {
                if(err) {return next(err); }
                // successful - redirect to the new author page
                res.redirect(author.url);
            });
        }
    }
];

// Display Author delete form on GET.
exports.author_delete_get = function(req, res, next){
    async.parallel({
        author: function(callback) {
            Author.findById(req.params.id).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({'author': req.params.id}).exec(callback)
        }
    }, function(err, results) {
       if(err) {return next(err); }
       if(results.author == null) {
           res.redirect('catalog/authors');
       }
       // successful so render
       res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
    });
};

// Handle Author delete on POST.
exports.author_delete_post = function(req, res, next) {
    async.parallel({
        author: function(callback) {
            Author.findById(req.body.authorid).exec(callback)
        },
        authors_books: function(callback) {
            Book.find({'author': req.body.authorid}).exec(callback)
        }
    }, function(err, results) {
        if(err) { return next(err) }
        if(results.authors_books.length > 0) {
            // Author has books render the same way as for the get route
            res.render('author_delete', {title: 'Delete Author', author: results.author, author_books: results.authors_books});
        }
        else {
            // author has no books, delete author and redirect to the authors list page
            Author.findByIdAndRemove(req.body.authorid, function deleteAuthor(err) {
                if(err) {return next(err)};
                // success - go to the author page: 
                res.redirect('/catalog/authors');
            })
        }
    }
    
    )
};

// Display Author update form on GET.
exports.author_update_get = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update GET' + req.params.id);
};

// Handle Author update on POST.
exports.author_update_post = function(req, res) {
    res.send('NOT IMPLEMENTED: Author update POST' + req.params.id);
};