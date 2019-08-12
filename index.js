// load env vars
require('dotenv').config()
var fs = require('fs')
const {dialogflow, SimpleResponse, RichResponse} = require('actions-on-google')
const express = require('express')
const bodyParser = require('body-parser')
const { exec } = require('child_process');
const app = dialogflow()
const port = process.env.PORT || 8081
const dgram = require('dgram')
const axios = require('axios')

const ANDROID_APP = "http://192.168.86.250:8080/"

directions = {'left': [0,-1], 'right': [0,1] ,'up': [1,1] ,'down': [1,-1]}

function moveSpacenavigator(direction){
  var command = './controler/write-event /dev/input/spacenavigator ' + directions[direction][0] + " " +(100*directions[direction][1])
  exec(command, function callback(error, stdout, stderr){
    console.log(stdout,stderr)
  })
}


var sock = dgram.createSocket('udp4')

var lgPosition = { lat:'41.56',lon:'0.59',}
// get location data of liquid Galaxy
LG_BROADCAST_IP   = "10.42." + process.env.LG_OCTET + ".255"
LG_BROADCAST_PORT = process.env.VIEWSYNC_PORT

console.log(LG_BROADCAST_IP,LG_BROADCAST_PORT)

sock.on('listening', function () {
    var address = {address: LG_BROADCAST_IP, port: LG_BROADCAST_PORT};
    console.log('UDP Client listening on ' + address.address + ":" + address.port);
    sock.setBroadcast(true);
});
sock.on('message', function (message, rinfo) {
    message = message.toString().split(',');
    lgPosition['lat']   = message[1]
    lgPosition['lon']   = message[2]
    lgPosition['alt']   = message[3]
    lgPosition['yaw']   = message[4]
    lgPosition['pitch'] = message[5]
});

sock.bind(LG_BROADCAST_PORT)

app.intent('Stop',function(conv){
  response = new SimpleResponse({
    text: "okey! done! tell me if you want to move the Liquid Galaxy again!",
    speech: "okey! done! tell me if you want to move the Liquid Galaxy again!"
  })
  conv.ask(response)
})



app.intent('Fly',function(conv){
  console.log(conv.parameters)
  if(conv.parameters['geo-city'] == "" && conv.parameters['geo-country'] == ""){
    response = new SimpleResponse({
      text: "Sorry I don't know that place",
      speech: "Sorry I don't know that place"
    })
  }else{
    var text = 'search=' + (conv.parameters['geo-city'] || conv.parameters['geo-country'])
    fs.writeFile('/tmp/query.txt', text,function(err){
      console.log(err)
    })
    response = new SimpleResponse({
      text: "flying to " + conv.parameters['geo-city'],
      speech: "flying to " + conv.parameters['geo-city']
    })

  }
  conv.ask( response )
})

app.intent('Where',function(conv){
  console.log(conv.parameters)
  var url = 'https://api.opencagedata.com/geocode/v1/json?q='+lgPosition['lat']+','+lgPosition['lon']+'&key=' + process.env.OPENCAGE_API_KEY
  return axios.get(url)

  .then(function(res){
    var data = res.data.results[0].geometry
    response = new SimpleResponse({
      text: "you are in: " + res.data.results[0].formatted, //+ data.time_zone[0].localtime.split(' ')[1],
      speech:"you are in: " + res.data.results[0].formatted //+ data.time_zone[0].localtime
    })
    conv.ask( response )
  })
  .catch(function(err){
    console.log(err)
  })
})

app.intent('Weather',function(conv){
  var url = 'http://api.worldweatheronline.com/premium/v1/past-weather.ashx?q=' + lgPosition['lat'] + ','+lgPosition['lon'] +'&format=json&key=' + process.env.TIME_EGG_KEY
  console.log('yep')
  return axios.get(url)
  .then(function(res){
    var data = res.data.data.weather[0]
    response = new SimpleResponse({
      text: "here it's: " + data.avgtempC  + ' celsius',
      speech:"here it's " + data.avgtempC + ' celsius'
    })
    conv.ask(response)
  })
  .catch(function(err){
    console.log(err)
  })

})

app.intent('Time',function(conv){
  console.log(conv.parameters)

  var url = 'https://api.worldweatheronline.com/premium/v1/tz.ashx/?q=' + lgPosition['lat']+','+lgPosition['lon'] + '&format=json&key=' + process.env.TIME_EGG_KEY


    return axios.get(url)
    .then(function(res){
      var data = res.data.data
      response = new SimpleResponse({
        text: "your hour is: " + data.time_zone[0].localtime.split(' ')[1],
        speech:"your hour is: " + data.time_zone[0].localtime
      })
      conv.ask(response)
    })
    .catch(function(err){
      console.log(err)
    })

})

app.intent('Find a plane',function(conv){
  response = new SimpleResponse({
    text: "Nice Plane, good choice",
    speech: "Nice Plane, good choice"
  })
  console.log(conv.parameters)
  conv.ask(response)
})

const expressApp = express().use(bodyParser.json())



app.intent('Movements',function(conv){
  response = new SimpleResponse({
  speech: "Going " + conv.parameters['directions'],
  text: "Going " + conv.parameters['directions']
})
  moveSpacenavigator(conv.parameters['directions'])
  conv.ask(response)
})

app.intent('Choose player name', function(conv){
  return axios.get(ANDROID_APP + "player/")
  .then(function(res){
    var data = res.data
    if(data.status == "IS_MULTIPLAYER_GAME") {
      response = new SimpleResponse({
        speech: "What's your name?",
        text: "What's your name?"
      })
    } else {
      response = new SimpleResponse({
        speech: "You must choose a trivia game first",
        text: "You must choose a trivia game first"
      })
    }
    conv.ask(response)
  })
  .catch(function(err){
    console.log(err)
  })
})

app.intent('Choose player name - first_name', function(conv){
  var lastnames = ""
  if("last-name" in conv.parameters) {
    conv.parameters["last-name"].forEach(function(element) {
      lastnames = lastnames + "%20" + element
    });
  }

  console.log(conv.parameters)
  var user_name = ""
  if("given-name" in conv.parameters && conv.parameters["given-name"] && conv.parameters["given-name"].length > 0) {
    user_name = conv.parameters["given-name"]
    console.log("given-name: " + user_name)
  } else if("person" in conv.parameters && conv.parameters["person"] && conv.parameters["person"]["name"].length > 0) {
    user_name = conv.parameters["person"]["name"]
    console.log("person: " + user_name)
  } else if("person2" in conv.parameters && conv.parameters["person2"] && conv.parameters["person2"].length > 0) {
    user_name = conv.parameters["person2"]
    console.log("person2: " + user_name)
  }
  return axios.get(ANDROID_APP + "player/" + user_name + lastnames)
  .then(function(res){
    var data = res.data
    if(data.status == "IS_MULTIPLAYER_GAME") {
      response = new SimpleResponse({
        speech: "Ok, what's the next player name?",
        text: "Ok, what's the next player name?"
      })
    } else {
      response = new SimpleResponse({
        speech: "You must choose a trivia game first",
        text: "You must choose a trivia game first"
      })
    }
    conv.ask(response)
  })
  .catch(function(err){
    console.log(err)
  })
})

app.intent('Play game', function(conv){
  return axios.get(ANDROID_APP + "play/game/" + conv.parameters["any"])
  .then(function(res){
    var data = res.data
    console.log(res.data)
    console.log(ANDROID_APP + "play/game/" + conv.parameters["any"])
    if(data.status == "IS_MULTIPLAYER_GAME") {
      response = new SimpleResponse({
        speech: "What's your name?",
        text: "What's your name?"
      })
    } else if(data.status == "OK"){
      response = new SimpleResponse({
        speech: "Good luck and have fun",
        text: "Good luck and have fun"
      })
    }
    else {
      response = new SimpleResponse({
        speech: "Oops! Something went wrong",
        text: "Oops! Something went wrong"
      })
    }
    conv.ask(response)
  })
  .catch(function(err){
    console.log(err)
  })
})

expressApp.post('/assistant', app)

expressApp.listen(port,function(){
  console.log(port, "linstening")
})
