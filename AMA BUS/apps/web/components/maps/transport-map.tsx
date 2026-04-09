"use client";

import { useEffect, useState } from "react";
import { GoogleMap, useJsApiLoader, Polyline, OverlayView } from "@react-google-maps/api";
import type { BusRoute, BusStop, LiveBus } from "@amaride/shared";

type MapProps = {
  routes?: BusRoute[];
  stops?: BusStop[];
  liveBuses?: LiveBus[];
  userLocation?: { latitude: number; longitude: number } | null;
};

const libraries: "places"[] = ["places"];
const mapContainerStyle = { width: "100%", height: "100%" };

export function TransportMap({ routes = [], stops = [], liveBuses = [], userLocation }: MapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey ?? "",
    libraries,
  });

  const [map, setMap] = useState<google.maps.Map | null>(null);

  const center = { lat: 20.296, lng: 85.826 };

  useEffect(() => {
    if (map && isLoaded) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasPoints = false;
      
      routes.forEach(route => {
        route.path.forEach(p => {
          bounds.extend({ lng: p[0], lat: p[1] });
          hasPoints = true;
        });
      });
      stops.forEach(s => {
        bounds.extend({ lng: s.longitude, lat: s.latitude });
        hasPoints = true;
      });
      liveBuses.forEach(b => {
        bounds.extend({ lng: b.longitude, lat: b.latitude });
        hasPoints = true;
      });
      if (userLocation) {
        bounds.extend({ lng: userLocation.longitude, lat: userLocation.latitude });
        hasPoints = true;
      }
      
      if (hasPoints) {
        map.fitBounds(bounds, 50);
      }
    }
  }, [map, isLoaded, routes, stops, liveBuses, userLocation]);

  if (!apiKey) {
    return (
      <div className="glass-panel relative overflow-hidden rounded-[1.75rem] p-5 shadow-panel">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(13,148,136,0.18),transparent_35%),linear-gradient(135deg,rgba(15,23,42,0.06),transparent_45%)]" />
        <div className="relative h-[360px] rounded-[1.25rem] border border-dashed border-slate-300/80 flex items-center justify-center bg-white/50 p-4 dark:border-slate-700 dark:bg-slate-900/40">
           <div className="text-center">
             <p className="font-semibold text-slate-800 dark:text-slate-200">Google Maps Unavailable</p>
             <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 max-w-sm mx-auto">Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable full Google Maps rendering.</p>
           </div>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="h-[460px] w-full animate-pulse rounded-[2rem] shadow-glass border border-slate-700/30 bg-slate-800/50" />;
  }
  
  const darkMapStyle = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
      featureType: "administrative.locality",
      elementType: "labels.text.fill",
      stylers: [{ color: "#d59563" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#38414e" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#212a37" }],
    },
    {
      featureType: "water",
      elementType: "geometry",
      stylers: [{ color: "#17263c" }],
    },
  ];

  return (
    <div className="h-[460px] overflow-hidden rounded-[2rem] shadow-glass border border-slate-700/30 font-sans">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={setMap}
        onUnmount={() => setMap(null)}
        options={{
          styles: darkMapStyle,
          disableDefaultUI: true,
          zoomControl: true,
        }}
      >
        {routes.map((route, i) => (
          <Polyline
            key={route.id}
            path={route.path.map((p) => ({ lng: p[0], lat: p[1] }))}
            options={{
              strokeColor: route.color,
              strokeOpacity: 0.85,
              strokeWeight: i === 0 ? 5 : 3,
            }}
          />
        ))}

        {stops.map((stop) => (
          <OverlayView
            key={`stop-${stop.id}`}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div className="flex h-4 w-4 -translate-y-1/2 -translate-x-1/2 items-center justify-center">
               <div className="h-2.5 w-2.5 rounded-full border border-white/50 bg-signal shadow-[0_0_8px_rgba(251,146,60,0.8)]" />
            </div>
          </OverlayView>
        ))}

        {liveBuses.map((bus) => (
          <OverlayView
            key={`bus-${bus.id}`}
            position={{ lat: bus.latitude, lng: bus.longitude }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="pulse-dot" />
            </div>
          </OverlayView>
        ))}

        {userLocation && (
          <OverlayView
            key="user-location"
            position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div className="flex -translate-x-1/2 -translate-y-1/2 items-center justify-center">
              <div className="h-4 w-4 animate-pulse rounded-full border-2 border-white bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)]" />
            </div>
          </OverlayView>
        )}
      </GoogleMap>
    </div>
  );
}
