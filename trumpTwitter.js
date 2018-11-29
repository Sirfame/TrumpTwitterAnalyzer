'use-strict'

var Twitter = require('twitter');

let https;
if(process.env.NODE_ENV === 'staging') {
    https = require ('https');
} else {
    https = require('http')
}

//////////////////////////////////
// Connect to Twitter
//////////////////////////////////

module.exports = {
    getTweets() {

        var client = new Twitter({
            consumer_key: global.gConfig.twitter_config_values.consumer_key,
            consumer_secret: global.gConfig.twitter_config_values.consumer_secret,
            access_token_key: global.gConfig.twitter_config_values.access_token_key,
            access_token_secret: global.gConfig.twitter_config_values.access_token_secret
          });
           
        var params = {screen_name: 'realDonaldTrump', count: '10', tweet_mode: 'extended'};
        var filteredTweets = {}

        return new Promise(function(resolve, reject) {
            client.get('statuses/user_timeline', params, function(error, tweets) {
                if (!error) {
                    for(var i = 0; i < tweets.length; i++) {
                        filteredTweets[tweets[i].id] = {
                            'tweetID' : '' + tweets[i].id,
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
}
