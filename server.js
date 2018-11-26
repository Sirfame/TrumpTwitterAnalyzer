'use strict';
// Requires
var express = require('express');
var redis = require('redis')

// environment variables
process.env.NODE_ENV = 'development';

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
    console.log(filteredTweets)
    return getSentiment(newTweets);
}).then(function(newTweetScores) {
    console.log('/////////////////: Parsing JSON')
    console.log(newTweetScores)
    return JSON.parse(newTweetScores)
}).then(function(jsonScores) {
    console.log('/////////////////: Adding to Redis')
    for(var i = 0; i < jsonScores['documents'].length; i++) {
        redisClient.set(jsonScores['documents'][i]['id'], JSON.stringify({
            "score" : jsonScores['documents'][i]['score'],
            "text" : filteredTweets[jsonScores['documents'][i]['id']]['text'],
            "id" : jsonScores['documents'][i]['id']
        }), redis.print)
    }
}).catch(function(error) {
    console.log("Error: " + error);
});

app.listen(global.gConfig.node_port, () => {
    console.log(`${global.gConfig.app_name} listening on port ${global.gConfig.node_port}`);
});
