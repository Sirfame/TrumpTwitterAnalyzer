'use-strict'

var Twitter = require('twitter');

var https;
if(process.env.NODE_ENV === 'staging') {
    https = require ('https');
} else {
    https = require('http')
}

// config variables
const config = require('./config/config.js');
//////////////////////////////////
// Connect to Twitter
//////////////////////////////////
var consumer_key = global.gConfig.twitter_config_values.consumer_key;
var consumer_secret =  global.gConfig.twitter_config_values.consumer_secret;
var access_token_key = global.gConfig.twitter_config_values.access_token_key;
var access_token_secret = global.gConfig.twitter_config_values.access_token_secret;
var uri = global.gConfig.twitter_config_values.uri;
var oauthPath = global.gConfig.twitter_config_values.oauthPath;
var timelinePath = global.gConfig.twitter_config_values.timelinePath;
var port = global.gConfig.twitter_config_values.port;           
        
var encodedConsumerKey = encodeURIComponent(consumer_key);
var encodedConsumerSecret = encodeURIComponent(consumer_secret);

var twitterBearerToken = new Promise(function(resolve, reject) {
    var body = "grant_type=client_credentials";
    var request_params = {
        method : 'POST',
        hostname : uri,
        path: oauthPath,
        port: port,
        headers : {
            'Authorization' : 'Basic ' + Buffer.from(encodedConsumerKey  + ":" +  encodedConsumerSecret).toString('base64'),
            'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length' : body.length,
        }
    }
    if(process.env.NODE_ENV == 'staging') {
        delete request_params.port;
    }
    let req = https.request(request_params, function(response) {
        let res = '';
        response.on('data', function(d) {
            res += d;
        });
        response.on('end', function() {
            let body__ = JSON.stringify (res, null, '  ');
            resolve(JSON.parse(res));
        });
        response.on('error', function(e) {
            console.log('Error: ' + e.message);
            reject(Error('Error: ' + e.message))
        })
    
    });
    req.write(body);
    req.end();    
});

var timelineAPICall = function(fullBearerTokenResponse) {
    //var parsedJSON = JSON.parse(fullBearerTokenResponse)
    var bearerToken = fullBearerTokenResponse['access_token']
    return new Promise(function(resolve, reject) {
        var request_params = {
            method : 'GET',
            host : uri,
            path : timelinePath,
            port : port,
            headers : {
                'Authorization' : 'Bearer ' + bearerToken
            }
        }
        if(process.env.NODE_ENV == 'staging') {
            delete request_params.port;
        }
        var request = https.request(request_params, function(response) {
            var res = '';
            response.on('data', function(d) {
                res += d;
            });
            response.on('end', function() {
                // let body = JSON.parse(res);
                //let res_ = JSON.stringify(res, null, '  ');
                resolve(res);
            });
            response.on('error', function(e) {
                reject(Error('Error: ' + e.message))
            });
        });
        request.end();
    
    });
}



module.exports = {
    getTweets() {
        return new Promise(function(resolve, reject) {
            twitterBearerToken.then(function(bearerToken) {
                return timelineAPICall(bearerToken);
            }).then(function(response) {
                var jsonResponse = JSON.parse(response)
                var filteredTweets = {}
                for(var i = 0; i < jsonResponse.length; i++) {
                    filteredTweets[jsonResponse[i].id] = {
                        'tweetID' : '' + jsonResponse[i].id,
                        'text' : jsonResponse[i].full_text,
                        'created' : jsonResponse[i].created_at
                    }
                }
                for(var id in filteredTweets) {
                    var tweet = filteredTweets[id];
                    console.log(tweet)
                }
                resolve(filteredTweets);
            }).catch(function(err) {
                reject(Error("Error " + err));
            });
        });
    }
}