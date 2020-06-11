const express = require('express');
const pino = require('express-pino-logger')();
const nba = require('nba-pbp-video');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(pino);
app.use(cors({origin:true,credentials: true}));

app.post('/playByPlay', function(req, res){    
    var gameID = req.body.GAMEID;
    var options = {formatted: true, parameters: false}
    
    nba.playByPlay({GameID: gameID, options}).then(function(data){
        res.send(data)
    });
})

app.post('/getPBPVideoURL', function(req, res){
    console.log(req.body)
    var event = req.body.EVENT;
    var gameID = req.body.GAMEID;

    nba.getPBPVideoURL({EventNum: event, GameID: gameID}).then(function(data){
        console.log(data)
        res.send(data);
    });
})

app.listen(3001, () =>
  console.log('Express server is running on localhost:3001')
);