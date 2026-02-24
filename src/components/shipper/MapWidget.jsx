import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { geocodeAddress } from "../../utils/geocode";
import { Polyline } from "react-leaflet";
import { getAllBills } from "../../services/billService";
const shipperIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
function FocusMarker({ position }) {
  const map = useMap();
  const prevRef = React.useRef();
  useEffect(() => {
    if (!position) return;
    // Chỉ aim nếu vị trí thực sự thay đổi
    if (
      !prevRef.current ||
      position[0] !== prevRef.current[0] ||
      position[1] !== prevRef.current[1]
    ) {
      map.flyTo(position, 17, {
        duration: 1.5,
      });
      prevRef.current = position;
    }
  }, [position, map]);
  return null;
}

function FitBounds({ shipperPosition, orders }) {
  const map = useMap();

  useEffect(() => {
    const points = [];
    if (shipperPosition) points.push(shipperPosition);

    orders.forEach((order) => {
      if (order.position) points.push(order.position);
    });

    if (points.length > 0) {
      map.fitBounds(points, { padding: [50, 50] });
    }
  }, [shipperPosition, orders, map]);

  return null;
}

function LocateButton({ position }) {
  const map = useMap();

  const handleClick = () => {
    if (!position) return;
    map.flyTo(position, 18, { duration: 1.5 });
  };

  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar">
        <button
          onClick={handleClick}
          className="bg-white w-10 h-10 flex items-center justify-center shadow hover:bg-gray-100"
          title="Vị trí của bạn"
        >
          <span className="material-symbols-outlined text-primary">
            my_location
          </span>
        </button>
      </div>
    </div>
  );
}

export default function MapWidget({
  selectedOrder,
  onDistanceChange,
  orders: externalOrders = null,
}) {
  const fakeShipperPosition = [10.776889, 106.700806];
  const [shipperPosition, setShipperPosition] = useState(null);
  const [orders, setOrders] = useState([]);
  const [routeCoords, setRouteCoords] = useState([]);
  const [distanceKm, setDistanceKm] = useState(null);
  const selectedOrderWithCoords = orders.find(
    (o) => o.id === selectedOrder?.id,
  );

  useEffect(() => {
    if (onDistanceChange) {
      onDistanceChange(distanceKm);
    }
  }, [distanceKm]);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.log("Browser không hỗ trợ GPS");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setShipperPosition([lat, lng]);
      },
      (err) => {
        console.error("GPS error:", err);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // useEffect(() => {
  //   setRouteCoords([]);
  //   setDistanceKm(null);
  // }, [selectedOrder?.id]);

  useEffect(() => {
    async function loadOrders() {
      let source = externalOrders;

      if (!Array.isArray(source)) {
        const res = await getAllBills();
        source = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
      }

      const result = [];

      for (const order of source) {
        if (!order.address) continue;

        const fullAddress = `${order.address.detailAddress}, ${order.address.ward}, ${order.address.city}`;

        try {
          const coords = await geocodeAddress(fullAddress);

          if (!coords) continue;

          result.push({
            ...order,
            position: coords,
          });
        } catch (err) {
          console.error("Geocode failed:", fullAddress, err);
        }

        await new Promise((r) => setTimeout(r, 200));
      }

      setOrders(result);
    }

    loadOrders();
  }, [externalOrders]);

  useEffect(() => {
    if (!selectedOrderWithCoords) return;
    if (!shipperPosition || !selectedOrderWithCoords?.position) return;
    async function fetchRoute() {
      // const [startLat, startLng] = fakeShipperPosition;
      const [startLat, startLng] = shipperPosition;
      const [endLat, endLng] = selectedOrderWithCoords.position;

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${startLng},${startLat};${endLng},${endLat}` +
          `?overview=full&geometries=geojson`;

        const res = await fetch(url);
        const data = await res.json();

        if (!data.routes || data.routes.length === 0) return;

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map((c) => [c[1], c[0]]);

        setRouteCoords(coords);

        const km = route.distance / 1000;
        setDistanceKm(km.toFixed(2));
      } catch (err) {
        console.error("Route error:", err);
      }
    }

    fetchRoute();
  }, [selectedOrder?.id]);

  const defaultPosition = [10.7769, 106.7009];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-neutral-200 shadow-sm overflow-hidden h-full flex flex-col">
      <div className="p-4 font-bold flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">map</span>
        Lộ trình dự kiến
      </div>

      <div className="h-[300px] lg:h-[400px] w-full">
        <MapContainer
          center={shipperPosition || fakeShipperPosition || defaultPosition}
          zoom={15}
          scrollWheelZoom={true}
          className="h-screen w-full z-0"
        >
          <FocusMarker
            position={selectedOrderWithCoords?.position}
            selectedOrderId={selectedOrder?.id}
          />
          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocateButton position={shipperPosition || fakeShipperPosition} />

          {shipperPosition && (
            <Marker position={shipperPosition} icon={shipperIcon}>
              <Popup>
                Shipper hiện tại <br />
                Lat: {shipperPosition[0]} <br />
                Lng: {shipperPosition[1]}
              </Popup>
            </Marker>
          )}
          {/* DÙng để fake vị trí của shipper */}
          {/* {fakeShipperPosition && (
            <Marker position={fakeShipperPosition} icon={shipperIcon}>
              <Popup>
                Shipper hiện tại <br />
                Lat: {fakeShipperPosition[0]} <br />
                Lng: {fakeShipperPosition[1]}
              </Popup>
            </Marker>
          )} */}

          {orders.map(
            (order) =>
              order.position && (
                <Marker
                  key={order.id}
                  position={order.position}
                  icon={markerIcon}
                >
                  <Popup>
                    {order.id}
                    <br />
                    {order.address.detailAddress}, {order.address.ward},{" "}
                    {order.address.city}
                  </Popup>
                </Marker>
              ),
          )}
          {!selectedOrder && (
            <FitBounds shipperPosition={shipperPosition} orders={orders} />
          )}
          {/* {!selectedOrder && (
            <FitBounds
              fakeShipperPosition={fakeShipperPosition}
              orders={orders}
            />
          )} */}

          {routeCoords.length > 0 && (
            <Polyline
              positions={routeCoords}
              pathOptions={{ color: "blue", weight: 5 }}
            />
          )}
        </MapContainer>
      </div>
    </div>
  );
}
