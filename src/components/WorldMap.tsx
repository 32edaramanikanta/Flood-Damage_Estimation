import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import floodIconUrl from "../assets/floods.png";
import wildfireIconUrl from "../assets/wildfire.jpg";
import volcanoIconUrl from "../assets/volcano.png";
import markerShadow from "../assets/marker-shadow.png";


type DisasterType = "flood" | "wildfire" | "volcano" | "earthquake" | "cyclone";

interface DisasterEvent {
  id: number;
  name: string;
  lat: number;
  lng: number;
  type: DisasterType;
  severity: string;
  area: number;
  houses: number;
}

interface WorldMapProps {
  activeLayer: string;
  selectedRegion: string;
}

// Example flood events (India-focused)
const floodEvents = [
  { id: 1, name: "West Bengal", lat: 22.9868, lng: 87.855, severity: "medium", area: 456.7, houses: 967 },
  { id: 2, name: "Assam", lat: 26.54114, lng: 92.47484, severity: "high", area: 890.2, houses: 2156 },
  { id: 3, name: "Raigarh", lat: 21.91437, lng: 83.54343, severity: "high", area: 890.2, houses: 328 },
  { id: 4, name: "Vijayawada", lat: 16.5151, lng: 80.6321, severity: "high", area: 890.2, houses: 2156 },
  { id: 5, name: "Manipur", lat: 24.6637, lng: 93.9063, severity: "high", area: 1.62, houses: 35384 },
  { id: 6, name: "Northeast India", lat: 26.2006, lng: 92.9376, severity: "very high", area: 1000, houses: 5000 },
  { id: 2, name: "ASR district ( Araku region)", lat: 18.5000, lng: 82.6167, severity: "high", area: 600.3, houses: 900 },
  { id: 3, name: "Vijayawada-Prakasam Barrage region", lat: 16.5062, lng: 80.6480, severity: "high", area: 20025, houses: 800 },
  { id: 2, name: "Godavari delta & Polavaram backwater (Eluru/Konaseema)", lat: 16.7, lng: 81.8, severity: "very high", area: 600.5, houses: 5584 },
  { id: 3, name: "Srikakulam (Sarubujjili/Burja/Ponduru)", lat: 18.3, lng: 83.9, severity: "high", area: 20.23, houses: 5200 },
  { id: 4, name: "Parvathipuram Manyam / Rajamahendravaram region", lat: 17.0, lng: 82.1, severity: "high", area: 700.9, houses: 3000 },
  { id: 5, name: "Mayapatnam (Kakinada district)", lat: 16.9620, lng: 82.2570, severity: "high", area: 1500, houses: 40 },
  { id: 5, name: "Ongole", lat: 15.5057, lng: 80.0499, severity: "high", area: 156.3, houses: 298 },


  
];

const icons = {
  flood: new L.Icon({ iconUrl: floodIconUrl, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
  wildfire: new L.Icon({ iconUrl: wildfireIconUrl, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
  volcano: new L.Icon({ iconUrl: volcanoIconUrl, shadowUrl: markerShadow, iconSize: [25, 41], iconAnchor: [12, 41] }),
  // Add more as needed
};

const disasterEvents: DisasterEvent[] = [
  { id: 1, name: "West Bengal Flood", lat: 22.9868, lng: 87.855, type: "flood", severity: "medium", area: 456.7, houses: 967 },
  { id: 2, name: "Assam Wildfire", lat: 26.54114, lng: 92.47484, type: "wildfire", severity: "high", area: 890.2, houses: 2156 },
  { id: 3, name: "Andaman Volcano", lat: 13.1667, lng: 93.0167, type: "volcano", severity: "critical", area: 10, houses: 0 },
  // ...add more, mixing types
];

// Example flood extent polygon (India)
const floodPolygon: [number, number][][] = [
  [
    [88.0, 22.0],
    [89.0, 22.0],
    [89.0, 23.0],
    [88.0, 23.0],
    [88.0, 22.0],
  ],
];

export const WorldMap = ({ activeLayer, selectedRegion }: WorldMapProps) => {
  // Define the southwest and northeast corners of India
  const indiaBounds: [[number, number], [number, number]] = [
    [6.5, 68.0],   // Southwest [lat, lng]
    [37.1, 97.5],  // Northeast [lat, lng]
  ];
  return (
    <div style={{ height: "600px", width: "100%" }}>
      <MapContainer
        center={[22.5937, 78.9629]} // Center of India
        zoom={5}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        maxBounds={indiaBounds}
        maxBoundsViscosity={1.0} // Prevents panning outside India
        minZoom={5} // Prevents zooming out too far
      >
        <TileLayer
          attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Flood extent polygon */}
        <Polygon positions={floodPolygon} pathOptions={{ color: "red", fillOpacity: 0.4 }} />

        {/* Flood event markers */}
        {floodEvents.map((event) => (
          <Marker key={event.id} position={[event.lat, event.lng]}>
            <Popup>
              <strong>{event.name}</strong>
              <br />
              Severity: {event.severity}
              <br />
              Area: {event.area} km²
              <br />
              Houses: {event.houses}
            </Popup>
          </Marker>
        ))}
        {disasterEvents.map((event) => (
  <Marker
    key={event.id}
    position={[event.lat, event.lng]}
    icon={icons[event.type]}
  >
    <Popup>
      <strong>{event.name}</strong>
      <br />
      Type: {event.type}
      <br />
      Severity: {event.severity}
      <br />
      Area: {event.area} km²
      <br />
      Houses: {event.houses}
    </Popup>
  </Marker>
))}
      </MapContainer>
    </div>
  );
};