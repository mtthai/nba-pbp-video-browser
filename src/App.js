import React, { Component } from 'react';
import './App.css';
import PlayList from './PlayList.js';
import SearchBar from './SearchBar.js';
import SelectBar from './SelectBar.js';

const request = require('request');
const schedule = require('./schedule.json');

class App extends Component {

  constructor(){
    super();

    this.state = {pbp: [], players: [], URL: '', title: '', selectedGame: {}}
    this.games = [];
    this.selectedPlayer = '';
    this.allPBP = [];
    this.playerPBP = [];
    this.playTypes = ["Made Shot", "Miss Shot", "Assist", "Rebound", "Turnover", 
    "Steal", "Block", "Foul", "Violation", "Jump Ball"];
  }

  getPBP = (gameID) => {

    document.getElementsByTagName('select')[0].selectedIndex = 0;
    this.setState({title: ''})
    this.setState({URL: ''})
    this.setState({shareURL: ''})

    request({
      url: 'http://localhost:3001/playByPlay', 
      method: 'POST',
      json: {
        GAMEID: gameID
      }
    }, (error, res, body) => {
      if(body.AvailableVideo.VIDEO_AVAILABLE_FLAG === 1 || 
        body.AvailableVideo.VIDEO_AVAILABLE_FLAG === 2)
         this.parsePBP(body)
       else this.setState({pbp: []})
    })

    // nba.playByPlay({GameID: gameID}, options).then((data) =>{
    //   console.log(data)

    //   if(data.AvailableVideo.VIDEO_AVAILABLE_FLAG === 1 || 
    //    data.AvailableVideo.VIDEO_AVAILABLE_FLAG === 2)
    //     this.parsePBP(data)
    //   else this.setState({pbp: []})
    // })
  }

  parsePBP = (data) => {
    var plays = [];
    var playsDeepCopy = [];
    var playersList = [];
    var temp = [];

    plays = this.filterPlays(data.PlayByPlay);

    for(var i=1; i<plays.length;i++){

      if(!plays[i].Description){
        if(plays[i].HOMEDESCRIPTION && plays[i].VISITORDESCRIPTION){
          plays[i].Description = plays[i].HOMEDESCRIPTION;
          playsDeepCopy[i] = JSON.parse(JSON.stringify(plays[i]));
          playsDeepCopy[i].Description = plays[i].VISITORDESCRIPTION;
          plays.splice(i, 0, playsDeepCopy[i])
        } else {
          plays[i].Description = plays[i].HOMEDESCRIPTION ? plays[i].HOMEDESCRIPTION : plays[i].VISITORDESCRIPTION;
        }

        if(plays[i].PLAYER1_NAME) temp.push(plays[i].PLAYER1_NAME)
          if(plays[i].PLAYER2_NAME) temp.push(plays[i].PLAYER2_NAME)
            if(plays[i].PLAYER3_NAME) temp.push(plays[i].PLAYER3_NAME) 
          }
      }

      playersList = [...new Set(temp)]

      document.getElementsByTagName('select')[1].selectedIndex = 0;
      this.selectedPlayer = "";
      this.allPBP = plays;
      this.playerPBP = plays;
      this.setState({pbp: plays})
      this.setState({players: playersList})
  }

  filterPlays = (data) => {
    //removing free throws (3), timeouts (9), and subs (8)
    var key, filteredData = [];
    for(key in data){
      if(!(data[key].EVENTMSGTYPE === 9 || 
       data[key].EVENTMSGTYPE === 8 || 
       data[key].EVENTMSGTYPE === 3)){
        filteredData.push(data[key])
      }
    }

    return filteredData;
  }

  getVidURL = (eventNum, gameID) => {
    request({
      url: 'http://localhost:3001/getPBPVideoURL', 
      method: 'POST',
      json: {
        GAMEID: gameID,
        EVENT: eventNum
      }
    }, (error, res, body) => {
      this.setState({URL: body})
    })

    // nba.getPBPVideoURL({EventNum: eventNum, GameID: gameID}).then((url) => {
    //   this.setState({URL: url})
    // })
  }

  getSelectedVideoDetails = (eventNum, title) => {
    this.getVidURL(eventNum, this.state.selectedGame.GameID) 
    this.setState({title: title})
  }

  getSelectedGame = (game) => {
    this.setState({
      selectedGame: game
    })

    this.getPBP(game.GameID)
  }

  getSelectedPlayer = (player) => {
    document.getElementsByTagName('select')[1].selectedIndex = 0;

    //filter other players miss, steals, blocks 

    var plays = this.allPBP;
    if(player !== 'all'){
      plays = plays.filter(play => play.PLAYER1_NAME === player || 
       play.PLAYER2_NAME === player || 
       play.PLAYER3_NAME === player) 
    }

    this.selectedPlayer = player;
    this.playerPBP = plays;
    this.setState({pbp: plays});
  }

  filterMadeShots = (player, plays) => {
    if(player !== 'all' && player){
      plays = plays.filter(play => play.EVENTMSGTYPE === 1
        && ((player === play.PLAYER1_NAME)));
    } else {
      plays = plays.filter(play => play.EVENTMSGTYPE === 1)
    }   

    return plays;    
  }

  filterAssists = (player, plays) => {
    if(player !== 'all' && player){
      plays = plays.filter(play => play.EVENTMSGTYPE === 1
        && play.Description.includes('AST')
        && ((player === play.PLAYER2_NAME)));
    } else {
      plays = plays.filter(play => play.EVENTMSGTYPE === 1
        && play.Description.includes('AST'))
    }

    return plays;
  }

  filterMissShots = (player, plays, homeTeamID, awayTeamID) => {
    if(player !== 'all' && player){
      plays = plays.filter(play => play.EVENTMSGTYPE === 2
        && !play.Description.includes('BLK')
        && ((player === play.PLAYER1_NAME && play.PERSON1TYPE === 5 && awayTeamID === play.PLAYER1_TEAM_ID) ||
          (player === play.PLAYER1_NAME && play.PERSON1TYPE === 4 && homeTeamID === play.PLAYER1_TEAM_ID)
          ));
    } else {
      plays = plays.filter(play => play.EVENTMSGTYPE === 2
        && !play.Description.includes('BLK'))
    }

    return plays;  
  }

  filterBlocks = (player, plays, homeTeamID, awayTeamID) => {
    if(player !== 'all' && player){
      plays = plays.filter(play => play.EVENTMSGTYPE === 2
        && play.Description.includes('BLK')
        && ((player === play.PLAYER3_NAME && play.PERSON3TYPE === 5 && awayTeamID === play.PLAYER3_TEAM_ID) ||
          (player === play.PLAYER3_NAME && play.PERSON3TYPE === 4 && homeTeamID === play.PLAYER3_TEAM_ID)
          ));
    } else {
      plays = plays.filter(play => play.EVENTMSGTYPE === 2
        && play.Description.includes('BLK'))
    }

    return plays;
  }

  filterTurnovers = (player, plays, homeTeamID, awayTeamID) => {
    if(player !== 'all' && player){
      plays = plays.filter(play => play.EVENTMSGTYPE === 5
        && !play.Description.includes('STL')
        && ((player === play.PLAYER1_NAME && play.PERSON1TYPE === 5 && awayTeamID === play.PLAYER1_TEAM_ID) ||
          (player === play.PLAYER1_NAME && play.PERSON1TYPE === 4 && homeTeamID === play.PLAYER1_TEAM_ID)
          ));
    } else {
      plays = plays.filter(play => play.EVENTMSGTYPE === 5
        && !play.Description.includes('STL'))
    }

    return plays;    
  }

  filterSteals = (player, plays, homeTeamID, awayTeamID) => {
    if(player !== 'all' && player){
      plays = plays.filter(play => play.EVENTMSGTYPE === 5
        && play.Description.includes('STL')
        && ((player === play.PLAYER2_NAME && play.PERSON2TYPE === 5 && awayTeamID === play.PLAYER2_TEAM_ID) ||
          (player === play.PLAYER2_NAME && play.PERSON2TYPE === 4 && homeTeamID === play.PLAYER2_TEAM_ID)
          ));
    } else {
      plays = plays.filter(play => play.EVENTMSGTYPE === 5
        && play.Description.includes('STL'))
    }

    return plays;   
  }

  getSelectedPlayType = (playType) => {

    var game = this.state.selectedGame;
    var player = this.selectedPlayer;
    var homeTeamID = game.HomeTeamID;
    var awayTeamID = game.AwayTeamID;
    var plays = this.playerPBP;


    switch(playType){
      case ("Made Shot"): {
        plays = this.filterMadeShots(player, plays);
        break;
      }
      case ("Assist"): {
        plays = this.filterAssists(player, plays);
        break;
      }
      case ("Miss Shot"): {
        plays = this.filterMissShots(player, plays, homeTeamID, awayTeamID);
        break;
      }
      case ("Block"): {
        plays = this.filterBlocks(player, plays, homeTeamID, awayTeamID);
        break;
      }
      case ("Rebound"): {
        plays = plays.filter(play => play.EVENTMSGTYPE === 4);        
        break;
      }
      case ("Turnover"): {
        plays = this.filterTurnovers(player, plays, homeTeamID, awayTeamID);
        break;
      }
      case ("Steal"): {
        plays = this.filterSteals(player, plays, homeTeamID, awayTeamID);
        break;
      }
      case ("Foul"): {
        plays = plays.filter(play => play.EVENTMSGTYPE === 6);
        break;
      }
      case ("Violation"): {
        plays = plays.filter(play => play.EVENTMSGTYPE === 7); 
        break;
      }
      case ("Jump Ball"): {
        plays = plays.filter(play => play.EVENTMSGTYPE === 10); 
        break;
      }

      default: break;       
    }

    this.setState({
      pbp: plays
    })
  }

  getSchedule = () => {
    for(var i=0; i<schedule.lscd.length;i++){
      for(var j=0; j<schedule.lscd[i].mscd.g.length;j++){
        var game = schedule.lscd[i].mscd.g[j];
        var homeCity = game.h.tc;
        var homeName = game.h.tn;
        var homeAbbr = game.h.ta;
        var homeTeamID = game.h.tid;
        var awayCity = game.v.tc;
        var awayName = game.v.tn;
        var awayAbbr = game.v.ta;
        var awayTeamID = game.v.tid;
        var date = game.gdte;

        this.games.push({GameID: game.gid,
         Arena: game.an,
         GameName: `${awayCity} ${awayName} @ ${homeCity} ${homeName} (${date})`,
         HomeCity: homeCity,
         HomeName: homeName,
         HomeAbbr: homeAbbr,
         HomeTeamID: homeTeamID,
         AwayCity: awayCity,
         AwayName: awayName,
         AwayAbbr: awayAbbr,
         AwayTeamID: awayTeamID,
         Date: date})
      }
    }
  }

  componentDidMount(){
    this.getSchedule();
  }

  render() {
    return (
      <div className="App">
        <div id="vid-wrapper">
          <SearchBar id="game-search" gameData={this.games} getSelectedGame={this.getSelectedGame}/>
          <video id="vid" key={this.state.URL} width="768" height="432" controls autoPlay>
            <source src={this.state.URL} type="video/mp4"/>
          </video>
          <div id="description">
            <span>{this.state.title}</span>
          </div>
        </div>
        <div id="plays-wrapper">
          <div id="select-wrapper">
            <SelectBar id="players-select" data={this.state.players} default="All Players" getSelected={this.getSelectedPlayer}/>
            <SelectBar id="play-select" data={this.playTypes} default="All Plays" getSelected={this.getSelectedPlayType}/>
          </div>
          <PlayList plays={this.state.pbp} getSelectedVideoDetails={this.getSelectedVideoDetails}/>
        </div>
      </div>
      );
  }
}

export default App;
