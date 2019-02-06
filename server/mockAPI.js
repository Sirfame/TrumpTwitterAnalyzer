'use strict';

//require the express module
var express    = require('express');
var morgan     = require('morgan');
var bodyParser = require('body-parser');
var fs         = require('fs');

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


//////////////////////////////////
// Mock Twitter API routes
//////////////////////////////////

app.get('/mocktwitterapi/usertimeline', function(req, res) {
  console.log(req.body);
  console.log("/////////////////: Called Mock Twitter API");
  fs.readFile('./mockTweetData3.txt', 'utf8', function(err, contents) {
    //var tweets = JSON.parse(contents);
    res.send(contents);
  });
});

app.post('/mocktwitterapi/oauth2token', function(req, res) {
  res.send(JSON.stringify('bearertoken'));
});

//////////////////////////////////
// Mock Microsoft API routes
//////////////////////////////////

app.post('/msapi/sentiment', function(req, res) {
  console.log(req.body);
  console.log("/////////////////: Called Mock Sentiment Analysis API");
  res.set('Content-Type', 'text/html')
  //res.send('{"documents":[]}');
  // var sampleResponse = { documents:
  //   [ { id: '1067775488112902100', score: 0.21074026823043823 },
  //     { id: '1067775425647136800', score: 0.5 },
  //     { id: '1067775315487924200', score: 0.5 },
  //     { id: '1067775191487533000', score: 0.5 },
  //     { id: '1067775022331236400', score: 0.7884500026702881 },
  //     { id: '1067624656943935500', score: 0.9560350775718689 } ],
  //  errors: [] };
  var sampleResponse = { documents:
    [ { id: '1071434642555920400', score: 0.1937270164489746 },
      { id: '1071408939684806700', score: 0.9929860830307007 },
      { id: '1071408938522996700', score: 0.9204695224761963 },
      { id: '1071389414239162400', score: 0.5 },
      { id: '1071387078901030900', score: 0.7723287343978882 },
      { id: '1071382401954267100', score: 0.20254328846931458 },
      { id: '1071252547170721800', score: 0.5 },
      { id: '1071177621445230600', score: 0.9973117113113403 },
      { id: '1071159669949911000', score: 0.5 },
      { id: '1071146400019169300', score: 0.9921731948852539 } ],
   errors: [] }
  res.send(JSON.stringify(sampleResponse))
});

//Listen for HTTP request on port 80
var listener = app.listen(8000, function() {
  console.log('Server is listening on port ' + listener.address().port);
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
// app.post('/api/v1/users', function(req, res) {
//   console.log(req.body);
//   res.json({message: 'new user created'});
// });
