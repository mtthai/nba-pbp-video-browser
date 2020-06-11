import React, { Component } from 'react';
import './SelectBar.css';

class SelectBar extends Component {

  handleChange(e){
    this.props.getSelected(e.target.value)
  }

  createDataList(data){
    var dataList = [];

    for(var i=0;i<data.length;i++){
      dataList.push(
        <option key={data[i]} value={data[i]}>{data[i]}</option>
      );
    }
    return dataList;
  }

  shouldComponentUpdate(nextProps, nextState){
    if(this.props.data !== nextProps.data)
      return true;
    return false;
  }

  render(props) {
    return (
      <select onChange={this.handleChange.bind(this)}>
        <option key="all" value="all">{this.props.default}</option>
        {this.createDataList(this.props.data)}
      </select>
    );
  }
}

export default SelectBar;
