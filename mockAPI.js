'use strict';

//require the express module
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');

//create a new express application
var app = express();

//log requests
app.use(morgan('dev'));

//parse JSON post bodies
app.use(bodyParser.json());

//serve static files from /static
app.use(express.static(__dirname + '/static'));

//log requests
app.use(function(req, res, next) {
  //log method and url
  console.log('%s %s', req.method, req.url);
  //continue processing request
  next();
});

// //Call this function for GET on /
// app.get('/', function(req, res) {
//   res.setHeader('Content-type', 'text/plain');
//   res.send('Hello World!');
// });
//
// //Call this function for GET on /time
// app.get('/time', function(req, res) {
//   res.setHeader('Content-type', 'text/plain');
//   res.send(new Date());
// });

app.get('/api/v1/users', function(req, res) {
  var users = [
    {
      email: 'test@test.com',
      displayName: 'Test user'
    },
    {
      email: 'test2@test.com',
      displayName: 'Test user2'
    }
  ];
  res.json(users);
});

app.post('/api/v1/users', function(req, res) {
  console.log(req.body);
  res.json({message: 'new user created'});
});

app.post('/msapi/sentiment', function(req, res) {
  console.log(req.body);
  console.log("/////////////////: Called Mock Sentiment Analysis API");
  res.json('{"documents":[]}');
});

//Listen for HTTP request on port 80
app.listen(8000, function() {
  console.log('Server is listening');
});
