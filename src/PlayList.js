import React, { Component } from 'react';

class PlayList extends Component {

  handleClick(e){
    this.props.getSelectedVideoDetails(e.target.dataset.key, e.target.text)
  }

  createPlayList(plays){
    var playList = [];

    for(var i=0; i<plays.length; i++){
      playList.push(
        <li key={i}><a id={plays[i].EVENTNUM} key={'play' + i} href="#" onClick={this.handleClick.bind(this)} data-key={plays[i].EVENTNUM}>{plays[i].Description}</a></li>
      );
    }
    return playList;
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.props.plays !== nextProps.plays)
      return true;
    return false;
  }

  render(props) {
    return (
      <ul>
        {this.createPlayList(this.props.plays)}
      </ul>
    );
  }
}

export default PlayList;
