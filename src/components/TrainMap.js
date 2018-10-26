import React from 'react';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';

export default function TrainMap({
  lat, lng, zoom,
}) {
  const position = [lat, lng]
  return (
    <Map style={{ height: 1000 }} center={position} zoom={zoom}>
      <TileLayer
        attribution="&amp;copy <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={position}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </Map>
  )
}
