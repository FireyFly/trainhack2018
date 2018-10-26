import React, { Component } from 'react';
import TrainMap from './components/TrainMap';
import FullHeight from './components/FullHeight';

class App extends Component {
  render() {
    return (
      <FullHeight>
        <TrainMap />
      </FullHeight>
    );
  }
}

export default App;
