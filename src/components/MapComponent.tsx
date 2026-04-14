import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Train, Bus, Ship, TramFront } from 'lucide-react';
import { renderToStaticMarkup } from 'react-dom/server';
import axios from 'axios';
import { cn } from '../lib/utils';

// Fix for default marker icons in Leaflet with React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Vehicle {
  id: string;
  tripId: string;
  routeId: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

interface MapComponentProps {
  selectedTripId?: string | null;
  activeTripIds?: string[];
}

const createVehicleIcon = (routeId: string, isHighlighted: boolean) => {
  const isMetro = routeId.startsWith('M');
  const isTrain = routeId.startsWith('T');
  const isBus = !isNaN(Number(routeId)) || routeId.length === 3;
  const isFerry = routeId.startsWith('F');
  const isLightRail = routeId.startsWith('L');
  
  let Icon = Train;
  let color = isHighlighted ? '#39ff14' : '#ffffff40';
  
  if (isTrain) {
    Icon = Train;
    if (!isHighlighted) color = '#f97316'; // Orange
  } else if (isMetro) {
    Icon = Train;
    if (!isHighlighted) color = '#2dd4bf'; // Teal
  } else if (isBus) {
    Icon = Bus;
    if (!isHighlighted) color = '#3b82f6'; // Blue
  } else if (isFerry) {
    Icon = Ship;
    if (!isHighlighted) color = '#10b981'; // Green
  } else if (isLightRail) {
    Icon = TramFront;
    if (!isHighlighted) color = '#ef4444'; // Red
  }

  const html = renderToStaticMarkup(
    <div style={{ color }} className={cn("filter drop-shadow-lg", isHighlighted && "scale-125")}>
      <Icon size={isHighlighted ? 32 : 24} fill="currentColor" />
    </div>
  );
  return L.divIcon({
    html,
    className: 'custom-vehicle-icon',
    iconSize: isHighlighted ? [32, 32] : [24, 24],
    iconAnchor: isHighlighted ? [16, 16] : [12, 12],
  });
};

const RecenterMap = ({ lat, lon }: { lat: number, lon: number }) => {
  const map = useMap();
  useEffect(() => {
    if (lat && lon) {
      map.setView([lat, lon], map.getZoom());
    }
  }, [lat, lon, map]);
  return null;
};

export const MapComponent: React.FC<MapComponentProps> = ({ selectedTripId, activeTripIds = [] }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      const response = await axios.get('/api/vehicles');
      setVehicles(response.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
    const interval = setInterval(fetchVehicles, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, []);

  // Filter vehicles to show only those on the searched route if activeTripIds is provided
  const filteredVehicles = activeTripIds.length > 0 
    ? vehicles.filter(v => activeTripIds.includes(v.tripId))
    : vehicles;

  const selectedVehicle = selectedTripId ? vehicles.find(v => v.tripId === selectedTripId) : null;

  return (
    <div className="h-[400px] w-full rounded-2xl overflow-hidden glass border border-white/10 relative">
      {isLoading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-midnight/50 backdrop-blur-sm">
          <div className="animate-spin text-neon-green">
            <Train className="w-8 h-8" />
          </div>
        </div>
      )}
      
      <MapContainer 
        center={[-33.8688, 151.2093]} 
        zoom={12} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {filteredVehicles.map((vehicle) => {
          const isSelected = vehicle.tripId === selectedTripId;
          return (
            <Marker 
              key={vehicle.id} 
              position={[vehicle.latitude, vehicle.longitude]}
              icon={createVehicleIcon(vehicle.routeId, isSelected)}
            >
              <Popup>
                <div className="text-midnight font-sans p-1">
                  <div className="font-bold border-b border-gray-200 mb-1 pb-1 flex items-center gap-2">
                    <Train className="w-4 h-4 text-orange-500" />
                    <span>Vehicle {vehicle.id}</span>
                  </div>
                  <div className="text-xs text-gray-600 flex flex-col gap-0.5">
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">Route:</span>
                      <span>{vehicle.routeId}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="font-semibold">Trip ID:</span>
                      <span className="font-mono text-[10px]">{vehicle.tripId}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {selectedVehicle && (
          <RecenterMap lat={selectedVehicle.latitude} lon={selectedVehicle.longitude} />
        )}
      </MapContainer>
    </div>
  );
};
