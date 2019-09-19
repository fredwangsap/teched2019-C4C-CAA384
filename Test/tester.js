require('dotenv').config();
const lambda = require('../Lambda/lambda');
var express = require('express');
var app = express();

console.log(`GATEWAY_URL = ${process.env.GATEWAY_URL}`);
console.log(`APIKEY = ${process.env.APIKEY}`);
console.log(`LEONARDO_URL = ${process.env.LEONARDO_URL}`);
console.log(`APPGW_HOST = ${process.env.APPGW_HOST}`);

app.get("/", async function (req, res) {
    var event = {
        "data": {
            "entity-id": req.query["entity-id"]
        },
        "extensions": {
            "request": req,
            "response": res
        }
    };

    await lambda.main(event, {});
    console.log("done");

});

app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
});