'use strict'
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
    res.send('Error, wrong token');
});

app.post('/webhook/', function (req, res) {
    let messaging_events = req.body.entry[0].messaging;
    for (let i = 0; i<messaging_events.length; i++){
        let event = req.body.entry[0].messaging[i];
        let sender = event.sender.id;
        if(event.message && event.message.text){
            let text = event.message.text;
            if(text === 'Generic'){
                sendGenericMessage(sender)
                continue;
            }
            sendTextMessage(sender, "Text received, echo: "+ text.substring(0, 200));
        }
        if(event.postback){
            let text = JSON.stringify(event.postback)
            sendTextMessage(sender, 'Postback received: '+text.substring(0,200, token));
            continue;
        }
    }
    res.sendStatus(200);
});


app.listen(app.get('port'), function () {
    console.log('The night king appears on port ', app.get('port'));
});

function sendTextMessage(sender, text) {
    let messageData = {text: text};
    request({
        url:'https://graph.facebook.com/v2.6/me/messages',
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

function sendGenericMessage(sender) {
    let messageData = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"generic",
                "elements":[
                    {
                        "title": "Pushup",
                        "subtitle": "Perform 40 pushups",
                        "image_url":"http://vignette4.wikia.nocookie.net/parkour/images/e/e0/Push_Up.jpg/revision/latest?cb=20141122161108",
                        "buttons":[
                            {
                                "type": "web_url",
                                "url":"http://www.bodybuilding.com/exercises/detail/view/name/pushups",
                                "title":"Exercise Video"
                            }
                        ]
                    },{
                        "title": "Benchpress",
                        "subtitle": "Perform 20 reps of benchpress",
                        "image_url":"http://www.bodybuilding.com/exercises/exerciseImages/sequences/360/Male/m/360_1.jpg",
                        "buttons":[
                            {
                                "type": "web_url",
                                "url": "http://www.bodybuilding.com/exercises/detail/view/name/pushups",
                                "title": "Excercise Video"
                            }
                        ]
                    }
                ]
            }
        }
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    });
}