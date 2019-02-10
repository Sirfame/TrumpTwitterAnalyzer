const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const redis = require("redis")
const bluebird = require('bluebird')
    


bluebird.promisifyAll(redis);
const app = express()
const redisClient = redis.createClient();


app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

redisClient.on('connect', function() {
  console.log('Redis client connected');
});

var redisCall = function(client) {  
  return new Promise(function(resolve, reject) {      
      client.get()
  
  });
}

app.get('/tweets', (req, res) => {
  res.send('test');
});

function getFromRedis(client, key) {
  return new Promise(function(resolve, reject) {
    redisClient.keys('*', function (err, keys) {
      if(err) reject(err);
      var tweets = [];
      for(key in keys) {
        
      }



    });
  });
}

app.get('/posts', (req, res) => {
  // res.send(
  //   [{
  //     title: "Hello World!",
  //     description: "Hi there! How are you?"
  //   }]
  // )
  var tweets = [];  
  redisClient.keys('*', function (err, keys) {
    if(err) console.error(err)

    for(var i = 0; i < keys.length; i++) {
      console.log(keys[i])
      redisClient.getAsync(keys[i]).then(JSON.parse).then( function(val) {
        console.log(val.text);
      })
    }
    res.send([{
      title: keys
    }]);
  
    
    
  });
});  

app.listen(process.env.PORT || 8081)