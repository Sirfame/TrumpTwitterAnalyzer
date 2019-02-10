const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const redis = require("redis")
const bluebird = require('bluebird')
    
// environment variables
process.env.NODE_ENV = 'staging';

// config variables
const config = require('../config/config.js');

bluebird.promisifyAll(redis);
const app = express()
const redisClient = redis.createClient({
  port : global.gConfig.redis_config_values.port,
  host : global.gConfig.redis_config_values.host,
  password : global.gConfig.redis_config_values.password
});
redisClient.on('connect', function() {
  console.log('Redis client connected');
});   


app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())

redisClient.on("error", function (err) {
  console.log("Error " + err);
});

var redisCall = function(client) {  
  return new Promise(function(resolve, reject) {      
      client.get()
  
  });
}

app.get('/posts', (req, res) => {

  var tweetPromiseArray = [];  
  var tweets = [{}];
  redisClient.keys('*', function (err, keys) {
    if(err) console.error(err)
    for(var i = 0; i < keys.length; i++) {
      tweetPromiseArray.push(redisClient.getAsync(keys[i]).then(JSON.parse).then(function(val) {
        return val;
      }));
    }
    Promise.all(tweetPromiseArray).then(function(data){
      for(var i = 0; i < data.length; i++) {
        tweets.push({
          'title': data[i].text,
          'score': data[i].score
        });
      }
      return tweets;
    }).then(function(val) {
      res.send(val);
    })
  });
});  

app.listen(process.env.PORT || 8081)