'use strict';

let https;
if(process.env.NODE_ENV === 'staging') {
    https = require ('https');
} else {
    https = require('http')
}


//////////////////////////////////
// Connect to MS API
//////////////////////////////////

let accessKey = global.gConfig.ms_config_values.accessKey;
let uri = global.gConfig.ms_config_values.uri;
let path = global.gConfig.ms_config_values.path;
let port = global.gConfig.ms_config_values.port;

module.exports = {
    getSentiment(documents) {
        let body = JSON.stringify (documents);
        let request_params;
        if(process.env.NODE_ENV === 'staging') {
            request_params = {
                method : 'POST',
                hostname : uri,
                path : path,
                headers : {
                    'Ocp-Apim-Subscription-Key' : accessKey,
                }
            };
        } else {
            request_params = {
                method : 'POST',
                hostname : uri,
                path : path,
                port : port,
                headers : {
                    'Ocp-Apim-Subscription-Key' : accessKey,
                }
            };
        }
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
            req.on('error', function(e) {
                console.log(e)
            })
            req.write(body);
            req.end();        
        });    
    }
}