const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const redis = require("redis")
const bluebird = require('bluebird')
    

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

app.get('/posts', (req, res) => {
  // res.send(
  //   [{
  //     title: "Hello World!",
  //     description: "Hi there! How are you?"
  //   }]
  // )
  redisClient.keys('*', function (err, keys) {
    res.send(
      [{
        title: keys
      }]
    )
  })
});  

app.listen(process.env.PORT || 8081)