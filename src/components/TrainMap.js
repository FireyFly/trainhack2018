import React, { Component } from 'react';
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
  '#cc8800', // 1
  '#cc0000', // 2
  '#cc00cc', // 3
];

const Center = [61.500, 14.500];
const Zoom = 6;

const selectedStopId0 = '740000923'; // Högsby
class TrainMap extends Component {
  state = {
    selectedStopId: selectedStopId0,
  }

  handlePressStop = (stopId) => {
    this.setState({ selectedStopId: stopId });
  }

  renderStops = ({ toStop }) => {
    return relevantStops.map(({ stopId, stopLat, stopLon, stopName }) => {
      const dist = toStop[stopId];
   // const color = colorMap[dist] || '#999'
      const color = '#999';
      const radius = dist === 0 ? 5 : 2;
      return (
        <CircleMarker
          center={[stopLat, stopLon]}
          key={stopId}
          radius={radius}
          color={color}
        >
          <Popup onOpen={() => this.handlePressStop(stopId)}>{ `${stopId} ${stopName}` }</Popup>
        </CircleMarker>
      );
    });
  }

  renderRoutesForStop = ({ toRoute }) => {
    const routesToRender = Object.keys(toRoute)
      .sort((a, b) => toRoute[b] - toRoute[a]);
    console.warn('render first', routesToRender[0], toRoute[routesToRender[0]]);
    const last = routesToRender.slice(-1)[0];
    console.warn('render last', last, toRoute[last]);
    return routesToRender.map(routeId => (
        <Polyline
          key={routeId}
          color={colorMap[toRoute[routeId]] || '#999'}
          positions={routeToStops[routeId].map(({ lat, lon }) => [lat, lon])}
          interactive={false}
        />
      ));
    }

  render() {
    const { selectedStopId } = this.state;
    console.time('distanceFromStop');
    const distance = distanceFromStop(selectedStopId);
    console.timeEnd('distanceFromStop');

    return (
      <Map style={{ height: '100%' }} center={Center} zoom={Zoom}>
        <TileLayer
          attribution="&amp;copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        { this.renderRoutesForStop(distance) }
        { this.renderStops(distance) }
      </Map>
    )
  }
}

export default TrainMap;
