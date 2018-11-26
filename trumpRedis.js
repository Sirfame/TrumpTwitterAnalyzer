'use strict';

var redis = require('redis')

//////////////////////////////////
// Connect to Redis
//////////////////////////////////

module.exports = {
    checkRedis(tweets) {
        var redisClient = redis.createClient({
            port : global.gConfig.redis_config_values.port,
            host : global.gConfig.redis_config_values.host,
            password : global.gConfig.redis_config_values.password
        });
        redisClient.on('connect', function() {
            console.log('Redis client connected');
        });        

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
}
