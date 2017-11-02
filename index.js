'use strict'
// require('dotenv').config();
const express = require('express'),
    bodyParser = require('body-parser'),
    request = require('request'),
    app = express(),
    token = process.env.FACEBOOK_PAGE_TOKEN;

app.set('port', (process.env.PORT || 3000));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
    res.send("hello I'm a chatbot");
});

app.get('/webhook/', function (req, res, next) {
    if (req.query['hub.verify_token'] === process.env.WEBHOOK_TOKEN) {
        res.send(req.query['hub.challenge']);
    }
    console.log('Wrong Token Received');
    res.send('Error, wrong token');
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i<messaging_events.length; i++){
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        if(event.message && event.message.text){
            let text = event.message.text;
            sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
        }
    }
    res.sendStatus(200);
    console.log("webhook post recieved")
});


app.listen(app.get('port'), function () {
    console.log('The night king appears on port ', app.get('port'));
});

function sendTextMessage(sender, text) {
    let messageData = {text: text};
    request({
        url:'https://graph.facebook.com/v2.1/me/messages',
        qs:{access_token: token},
        method: 'POST',
        json:{
            recipient: {id:sender},
            message: messageData
        }
    }, function (error, response, body) {
        if(error){
            console.log('Error sending messages: ', error)
        } else if(response.body.error){
            console.log('Error: ', response.body.error)
        }
    })
}