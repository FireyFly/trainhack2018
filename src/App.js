import React, { Component } from 'react';
import { Container, Segment } from 'semantic-ui-react';
import TrainMap from './components/TrainMap';

class App extends Component {
  render() {
    return (
      <Container>
        <Segment>
          <p>
            Hello world!
          </p>
        </Segment>
        <Segment>
          <TrainMap lat={61.500} lng={14.500} zoom={6} />
        </Segment>
      </Container>
    );
  }
}

export default App;
