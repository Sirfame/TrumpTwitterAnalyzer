'use strict';
// Requires
var express = require('express');
var redis = require('redis')

// environment variables
process.env.NODE_ENV = 'staging';

// config variables
const config = require('./config/config.js');

const getTweets = require('./trumpTwitter').getTweets;
const checkRedis = require('./trumpRedis').checkRedis;
const getSentiment = require('./trumpSentiment').getSentiment;

// module variables
const app = express();

//////////////////////////////////
// Promise chain
//////////////////////////////////

var filteredTweets = {}
var scoredTweets = {};


var redisClient = redis.createClient({
    port : global.gConfig.redis_config_values.port,
    host : global.gConfig.redis_config_values.host,
    password : global.gConfig.redis_config_values.password
});

getTweets().then(function(tweets) {
    console.log('///////////////// Calling Redis')
    console.log(tweets)
    filteredTweets = tweets
    return checkRedis(tweets);
}).then(function(newTweets) {    
    if(newTweets['documents'].length === 0) {
        console.log('/////////////////: No new tweets, skipping Sentiment Analysis API')
        return '{"documents":[]}';
    }
    console.log('/////////////////: Calling Sentiment Analysis API')
    return getSentiment(newTweets);
}).then(function(newTweetScores) {
    console.log('/////////////////: Parsing JSON')
    console.log(newTweetScores)
    return JSON.parse(newTweetScores)
}).then(function(jsonScores) {
    console.log('/////////////////: Adding to Redis')
    console.log(jsonScores)

    redisClient.on('connect', function() {
        console.log('Redis client connected');
    });   
    for(var i = 0; i < jsonScores['documents'].length; i++) {
        console.log("jsonscoreID" + jsonScores['documents'][i]['id']);
        var newRecord = JSON.stringify({
            "score" : jsonScores['documents'][i]['score'],
            "text" : filteredTweets[jsonScores['documents'][i]['id']]['text'],
            "id" : jsonScores['documents'][i]['id']
        });
        scoredTweets[jsonScores['documents'][i]['id']] = newRecord;
        redisClient.set(jsonScores['documents'][i]['id'], newRecord, redis.print)
    }
}).catch(function(error) {
    console.log("Error: " + error);
});

app.get('/', function(req, res) {
    redisClient.keys('*', function(err, keys) {
        for(var i = 0; i < keys.length; i++) {
            
        }
        res.send(keys)
    })
})

app.listen(global.gConfig.node_port, () => {
    console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
});
