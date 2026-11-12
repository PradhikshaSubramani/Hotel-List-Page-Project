import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ latitude, longitude, title }) => {
  const position = [parseFloat(latitude), parseFloat(longitude)];

  return (
    <div style={{ height: '350px', width: '100%', borderRadius: '8px', overflow: 'hidden', marginTop: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
      <MapContainer center={position} zoom={13} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={position}>
          <Popup>
            <strong>{title}</strong> <br />
            Lat: {latitude}, Lng: {longitude}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
};

export default MapView;