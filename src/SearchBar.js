import React, { Component } from 'react';
import Autosuggest from 'react-autosuggest';
import './SearchBar.css';

class SearchBar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      value: '',
      suggestions: [],
      selectedSuggestion: []
    };
  }

  getSuggestions = (value) => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : this.props.gameData.filter(game =>
      game.GameName.toLowerCase().includes(inputValue)
    );
  };

  getSuggestionValue = (suggestion) => suggestion.GameName;

  onChange = (event, { newValue }) => {
    this.setState({
      value: newValue
    });
  };

  renderSuggestion = (suggestion) => (
    <div>
      {suggestion.GameName}
    </div>
  );

  onSuggestionsFetchRequested = ({ value }) => {
    this.setState({
      suggestions: this.getSuggestions(value)
    });
  };

  onSuggestionsClearRequested = () => {
    this.setState({
      suggestions: []
    });
  };

  onSuggestionSelected = (event, { suggestion, suggestionValue, suggestionIndex, sectionIndex, method }) => {
    this.setState({selectedSuggestion: suggestion})
    this.props.getSelectedGame(suggestion)
  }


  render() {
    const { value, suggestions } = this.state;

    const inputProps = {
      placeholder: 'Search for a game by team or date',
      type: "search",
      value,
      onChange: this.onChange
    };

    return (
      <Autosuggest
        suggestions={suggestions}
        onSuggestionsFetchRequested={this.onSuggestionsFetchRequested}
        onSuggestionsClearRequested={this.onSuggestionsClearRequested}
        getSuggestionValue={this.getSuggestionValue}
        renderSuggestion={this.renderSuggestion}
        inputProps={inputProps}
        onSuggestionSelected={this.onSuggestionSelected}
      />
    );
  }
}

export default SearchBar;
