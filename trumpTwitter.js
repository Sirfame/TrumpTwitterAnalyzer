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

var getBearerToken = function (cb) {
    var fullBearerTokenResponse;
    var bearerTokenRequestBody = "grant_type=client_credentials";
    var bearerTokenRequestParams = {
        method : 'POST',
        hostname : uri,
        path: oauthPath,
        port: port,
        headers : {
            'Authorization' : 'Basic ' + Buffer.from(encodedConsumerKey  + ":" +  encodedConsumerSecret).toString('base64'),
            'Content-Type' : 'application/x-www-form-urlencoded;charset=UTF-8',
            'Content-Length' : bearerTokenRequestBody.length,
        }
    }
    if(process.env.NODE_ENV == 'staging') {
        delete bearerTokenRequestParams.port;
    }
    try{
        let bearerTokenRequest = https.request(bearerTokenRequestParams, function(response) {
            console.log(response.statusCode);
            console.log(response)
            let res = '';
            response.on('data', function(d) {
                res += d;
            });
            response.on('end', function() {
                let body__ = JSON.stringify (res, null, '  ');
                fullBearerTokenResponse = JSON.parse(res);
                cb(fullBearerTokenResponse);
            });

        }).on('error', function(e) {
            console.error('Error: ' + e.message);
        })    
        bearerTokenRequest.write(bearerTokenRequestBody);
        bearerTokenRequest.end();
    } catch(err) {
        console.error(err.message)
    }
}

var getTwitterTimeline = function (fullBearerTokenResponse) {
    bearerToken = fullBearerTokenResponse['access_token'];     
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
            return res;
        });
        response.on('error', function(e) {
            console.log('Error: ' + e.message);
        });
    });
    request.end();            
}

module.exports = {
    getTweets() {
        return new Promise(function(resolve, reject) {           
            
        });               
    }    
}
