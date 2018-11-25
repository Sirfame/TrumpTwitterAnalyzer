'use strict';
// Requires
var Twitter = require('twitter');
var express = require('express');
var redis = require('redis')
let https = require ('https');

// environment variables
process.env.NODE_ENV = 'development';

// config variables
const config = require('./config/config.js');

// module variables
const app = express();

app.get('/', (req, res) => {
    res.json(global.gConfig);
});

//////////////////////////////////
// Connect to Twitter
//////////////////////////////////
var client = new Twitter({
    consumer_key: global.gConfig.twitter_config_values.consumer_key,
    consumer_secret: global.gConfig.twitter_config_values.consumer_secret,
    access_token_key: global.gConfig.twitter_config_values.access_token_key,
    access_token_secret: global.gConfig.twitter_config_values.access_token_secret
  });
   
var params = {screen_name: 'realDonaldTrump', count: '10', tweet_mode: 'extended'};
var filteredTweets = {}

var twitterPromise = function() {
    return new Promise(function(resolve, reject) {
        client.get('statuses/user_timeline', params, function(error, tweets) {
            if (!error) {
                for(var i = 0; i < tweets.length; i++) {
                    filteredTweets[tweets[i].id] = {
                        'tweetID' : tweets[i].id,
                        'text' : tweets[i].full_text,
                        'created' : tweets[i].created_at
                    }
                }
                resolve(filteredTweets)
            } else {
                reject(Error(error));
            }
        });
    });
}

//////////////////////////////////
// Connect to MS API
//////////////////////////////////
let accessKey = global.gConfig.ms_config_values.accessKey;
let uri = global.gConfig.ms_config_values.uri;
let path = global.gConfig.ms_config_values.path;

var get_sentiments = function (documents) {
    let body = JSON.stringify (documents);
    let request_params = {
        method : 'POST',
        hostname : uri,
        path : path,
        headers : {
            'Ocp-Apim-Subscription-Key' : accessKey,
        }
    };
    return new Promise(function(resolve, reject) {
        let req = https.request (request_params, function (response) {
            let body = '';
            var res;
            response.on ('data', function (d) {
                body += d;
            });
            response.on ('end', function () {
                let body_ = JSON.parse (body);
                let body__ = JSON.stringify (body_, null, '  ');
                resolve(body__);
            });
            response.on ('error', function (e) {
                console.log ('Error: ' + e.message);
                reject(Error('Error: ' + e.message));
            });
        });
        req.write(body);
        req.end();        
    });    
}

//////////////////////////////////
// Connect to Redis
//////////////////////////////////
var redisClient = redis.createClient({
    port : global.gConfig.redis_config_values.port,
    host : global.gConfig.redis_config_values.host,
    password : global.gConfig.redis_config_values.password
});
redisClient.on('connect', function() {
    console.log('Redis client connected');
});

var redisPromise = function(tweets) {
    var tweetIDsFromRedis = { };
    var tweetIDsFromTwitter = { };
    var documents = { 'documents': [] };
    return new Promise(function(resolve, reject) {
        redisClient.keys('*', function (err, keys) {
            if (err) {
                reject(Error('Error: ' + err))
            }
            for(var i = 0; i < keys.length; i++) {
                tweetIDsFromRedis[keys[i]] = true;
                console.log("key from redis: " + keys[i]);
            }
            for(var id in tweets) {
                tweetIDsFromTwitter[id] = true;
                if(tweetIDsFromRedis[tweets[id].tweetID]) {
                    console.log("Exisiting tweet -- skipping");
                } else {
                    console.log("New tweet: ");
                    console.log(tweets[id]);
                    documents['documents'].push({ 'id': tweets[id].tweetID, 'langauge': 'en', 'text': tweets[id].text, 'created': tweets[id].created })
                }
            }
            for(var i = 0; i < keys.length; i++) {
                if(!tweetIDsFromTwitter[keys[i]]) {
                    console.log("Old tweets to delete from redis: " + keys[i])
                    redisClient.del(keys[i], redis.print);
                }
            }
            resolve(documents)
        });
    });
}

//////////////////////////////////
// Promise chain
//////////////////////////////////

twitterPromise().then(function(tweets) {
    console.log('/////////////////: Calling Redis')
    console.log(tweets)
    return redisPromise(tweets);
}).then(function(newTweets) {    
    if(newTweets['documents'].length === 0) {
        console.log('/////////////////: No new tweets, skipping Sentiment Analysis API')
        return '{"documents":[]}';
    }
    console.log('/////////////////: Calling Sentiment Analysis API')
    console.log(newTweets)
    return get_sentiments(newTweets);
}).then(function(newTweetScores) {
    console.log('/////////////////: Parsing JSON')
    console.log(newTweetScores)
    return JSON.parse(newTweetScores)
}).then(function(jsonScores) {
    console.log('/////////////////: Adding to Redis')
    console.log(jsonScores)
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
