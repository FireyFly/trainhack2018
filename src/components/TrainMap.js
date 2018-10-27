import React, { Component } from 'react';
import { Button, Label, Segment } from 'semantic-ui-react';
import { CircleMarker, Map, TileLayer, Polyline, Popup } from 'react-leaflet';
import loadCSVData from '../utilities/loadCSVData';
import distanceFromStop from '../services/routing/distanceFromStop';
import stopsCSV from '../data/stops.json';
import routeStopData from '../data/route-stop-map.json';

const { routeToStops, stopToRoutes } = routeStopData;
const stops = loadCSVData(stopsCSV);

const relevantStopIds = new Set(Object.keys(stopToRoutes));
const relevantStops = stops.filter(({ stopId }) => relevantStopIds.has(stopId));

const colorMap = [
  '#00cc00', // 0
  '#ffaa00', // 1
  '#cc0000', // 2
  '#0066ff', // 3
  '#999999', // 4
];

const ppDestinations = (n, withAre) => {
  const nPretty = n === 0 ? 'No' : String(n);
  const destinations = n === 1 ? 'destination' : 'destinations';
  const are = withAre ? (n === 1 ? 'is' : 'are') : '';
  return (
    <span><strong>{nPretty}</strong> {destinations} {are}</span>
  );
}

const Center = [61.500, 14.500];
const Zoom = 6;

class TrainMap extends Component {
  state = {
    selectedStopId: null,
    selectedStopName: null,
    steps: 1,
  }

  handlePressStop = (stopId, stopName) => {
    this.setState({ selectedStopId: stopId, selectedStopName: stopName });
  }

  handleChooseSteps = (n) => {
    this.setState({ steps: n });
  }

  renderStops = ({ toStop }) => {
    return relevantStops.map(({ stopId, stopLat, stopLon, stopName }) => {
      const dist = toStop[stopId];
      const color = '#999';
      const radius = dist === 0 ? 5 : 2;
      return (
        <CircleMarker
          center={[stopLat, stopLon]}
          key={stopId}
          radius={radius}
          color={color}
        >
          <Popup onOpen={() => this.handlePressStop(stopId, stopName)}>{ stopName }</Popup>
        </CircleMarker>
      );
    });
  }

  renderRoutesForStop = ({ toRoute }) => {
    const { steps } = this.state;
    const routesToRender = Object.keys(toRoute)
      .filter(n => toRoute[n] < steps)
      .sort((a, b) => toRoute[b] - toRoute[a]);
    return routesToRender.map(routeId => (
        <Polyline
          key={routeId}
          color={colorMap[toRoute[routeId]] || '#999'}
          positions={routeToStops[routeId].map(({ lat, lon }) => [lat, lon])}
          interactive={false}
        />
      ));
    }

  renderStepButtons = () => {
    const { steps } = this.state;
    return (
      <div
        style={{
          position: 'absolute',
          bottom: 14,
          left: 14,
          zIndex: 1000000,
        }}
      >
        <Label basic color="red" pointing='right' style={{ marginRight: 14 }}>
          # Trains away
        </Label>
        <Button.Group widths={1}>
          {
            [1, 2, 3, 4, 5].map(n => (
              <Button
                key={n}
                active={n === steps}
                style={{
                  color: n === steps ? '#eee' : colorMap[n - 1],
                  backgroundColor: n === steps ? colorMap[n - 1] : '#eee',
                }}
                onClick={() => this.handleChooseSteps(n)}
              >
                {n}
              </Button>
            ))
          }
        </Button.Group>
      </div>
    );
  }

  renderInfoBox = ({ toStop }) => {
    const { selectedStopName } = this.state;

    const distanceFreq = {};
    let distanceFreqSum = 0;
    Object.values(toStop).forEach((v) => {
      distanceFreq[v] = (distanceFreq[v] || 0) + 1;
      distanceFreqSum += 1;
    });

    // Don't count the originating station
    distanceFreqSum -= 1;

    return (
      <div
        style={{
          position: 'absolute',
          top: 14,
          right: 14,
          width: 400,
          zIndex: 1000000,
        }}
      >
        <Segment>
          {
            selectedStopName == null &&
            <div>
              <p>
                <strong>Welcome!</strong> Press a station marker to show all
                routes passing through this stop.
              </p>
              <p>
                Choose in the bottom left to select how many trains away you
                want to show routes for.
              </p>
              <p>
                <strong>Example:</strong> Three trains away means you have to
                make two changes to reach this destination, minimum.
              </p>
            </div>
          }
          {
            selectedStopName != null &&
            <div>
              <p>
                From <strong>{selectedStopName}</strong> you can reach <strong>{distanceFreqSum}</strong> destinations.
              </p>
              <p>
                Out of these,
              </p>
              <ul>
                <li>{ppDestinations(distanceFreq[1] || 0)} can be reached <strong style={{ color: colorMap[0] }}>directly</strong></li>
                <li>{ppDestinations(distanceFreq[2] || 0, true)} are <strong style={{ color: colorMap[1] }}>two</strong> trains away</li>
                <li>{ppDestinations(distanceFreq[3] || 0, true)} are <strong style={{ color: colorMap[2] }}>three</strong> trains away</li>
                <li>{ppDestinations(distanceFreq[4] || 0, true)} are <strong style={{ color: colorMap[3] }}>four</strong> trains away</li>
                <li>{ppDestinations(distanceFreq[5] || 0, true)} are <strong style={{ color: colorMap[4] }}>five</strong> trains away</li>
              </ul>
            </div>
          }
        </Segment>
      </div>
    );
  }

  render() {
    const { selectedStopId } = this.state;
    const distance = selectedStopId == null
      ? { toStop: {}, toRoute: {} }
      : distanceFromStop(selectedStopId);

    return (
      <div style={{ height: '100%' }}>
        { this.renderStepButtons() }
        { this.renderInfoBox(distance) }
        <Map style={{ height: '100%' }} center={Center} zoom={Zoom}>
          <TileLayer
            attribution="&amp;copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          { this.renderRoutesForStop(distance) }
          { this.renderStops(distance) }
        </Map>
      </div>
    )
  }
}

export default TrainMap;
