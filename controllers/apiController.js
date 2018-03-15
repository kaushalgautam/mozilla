var Book = require('../models/book');
var Author = require('../models/author');
var Genre = require('../models/genre');
var BookInstance = require('../models/bookinstance');
var mongoose = require('mongoose');
var async = require('async');
var debug = require("debug")("api");

exports.books_get = function(req, res, next) {
    Book.find()
    .populate('author')
    .populate('genre')
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        res.send(results);
    });
};

exports.book_get_id = function(req, res, next) {
    Book.findById(req.params.id)
    .populate('author')
    .populate('genre')
    .exec(function(err, results) {
        if(err) {
            res.send(err.message);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

exports.bookinstances_get = function(req, res, next) {
    BookInstance.find()
    .populate('book')
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

exports.bookinstance_get_id = function(req, res, next) {
    BookInstance.findById(req.params.id)
    .populate('book')
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

exports.genres_get = function(req, res, next) {
    Genre.find()
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

exports.genre_get_id = function(req, res, next) {
    Genre.findById(req.params.id)
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

exports.authors_get = function(req, res, next) {
    Author.find()
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

exports.author_get_id = function(req, res, next) {
    Author.findById(req.params.id)
    .exec(function(err, results) {
        if(err) {
            res.send(err);
        }
        else if(results != null)
            res.send(results);
        else
            res.send("No result");
    });
};

