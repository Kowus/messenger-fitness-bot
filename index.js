'use strict';
require('dotenv').config();
const express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express();

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
    res.send("hello I'm a chatbot");
});

app.get('/webhook/',function (req, res, next) {
    if(req.query['hub.verify_token'] === process.env.WEBHOOK_TOKEN){
        res.send(req.query['hub.challenge']);
    }
    res.send('Error, wrong token');
});

app.listen(app.get('port'),function () {
    console.log('The night king appears on port ', app.get('port'));
});