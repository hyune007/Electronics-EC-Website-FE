import React from "react";
import MapWidget from "../MapWidget";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
export default function NavigationMap({ order }) {
  return (
    <MapWidget
      selectedOrder={order}
      orders={order ? [order] : []}
    />
  );
}
