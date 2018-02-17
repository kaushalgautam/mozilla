var http = require("http");
var express = require("express");

var app = express();

app.get('/', function(req, res) {
    res.send("Hello, world!");
    
})

app.listen(process.env.PORT, function() {
    console.log('Example app listenting at ', process.env.PORT);
})