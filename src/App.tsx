import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Train, AlertCircle, Github, Map as MapIcon, Bookmark, X } from 'lucide-react';
import StationSearch from './components/StationSearch';
import TrainCard from './components/TrainCard';
import { MapComponent } from './components/MapComponent';
import { FavoriteTrips } from './components/FavoriteTrips';
import { cn } from './lib/utils';
import { Station, TrainUpdate, TransportMode } from './types';
import { supabase } from './lib/supabase';

const ROUTE_MAPPINGS: Record<string, string> = {
  'NSN': 'T1', 'IWL': 'T2', 'BNK': 'T3', 'ESL': 'T4', 'WST': 'T5',
  'OLY': 'T7', 'APL': 'T8', 'NNS': 'T9', 'BMT': 'BMT', 'CCN': 'CCN',
  'SCO': 'SCO', 'SHL': 'SHL', 'HUN': 'HUN', 'NRT': 'Metro',
  'L1': 'L1', 'L2': 'L2', 'L3': 'L3', 'F1': 'F1', 'F2': 'F2'
};

const STATION_NAMES: Record<string, string> = {
  '200010': 'Central', '200060': 'Town Hall', '200070': 'Wynyard', '200080': 'Circular Quay',
  '200090': 'St James', '200100': 'Museum', '201610': 'Redfern', '213510': 'Strathfield',
  '215010': 'Parramatta', '214810': 'Blacktown', '275010': 'Penrith', '207710': 'Hornsby',
  '206710': 'Chatswood', '206010': 'North Sydney', '202210': 'Bondi Junction', '222010': 'Hurstville',
  '223010': 'Cronulla', '223210': 'Sutherland', '256010': 'Campbelltown', '217010': 'Liverpool',
  '220010': 'Bankstown', '214110': 'Lidcombe', '213410': 'Burwood', '213110': 'Ashfield',
  '204910': 'Petersham', '204210': 'Newtown', '204810': 'Stanmore', '201620': 'Macdonaldtown',
  '204310': 'Erskineville', '204410': 'St Peters', '204420': 'Sydenham', '220510': 'Wolli Creek',
  '202010': 'International Airport', '202020': 'Domestic Airport', '202030': 'Mascot',
  '201710': 'Green Square', '201110': 'Kings Cross', '202710': 'Edgecliff', '214010': 'Homebush',
  '213210': 'Summer Hill', '213010': 'Lewisham', '212110': 'Epping', '212210': 'Eastwood',
  '211410': 'West Ryde', '211310': 'Meadowbank', '211210': 'Rhodes', '213810': 'Concord West',
  '213710': 'North Strathfield', '214410': 'Auburn', '214210': 'Berala', '214310': 'Regents Park',
  '216110': 'Guildford', '216010': 'Merrylands', '216210': 'Yennora', '216310': 'Fairfield',
  '216410': 'Canley Vale', '216510': 'Cabramatta', '216610': 'Warwick Farm', '216810': 'Casula',
  '217310': 'Holsworthy', '221310': 'East Hills', '221210': 'Panania', '221110': 'Revesby',
  '221010': 'Padstow', '220910': 'Riverwood', '220810': 'Narwee', '220710': 'Beverly Hills',
  '220610': 'Kingsgrove', '220410': 'Turrella', '220310': 'Bardwell Park', '220210': 'Bexley North',
  '221710': 'Kogarah', '221810': 'Carlton', '221910': 'Allawah', '222110': 'Penshurst',
  '222210': 'Mortdale', '222310': 'Oatley', '222410': 'Como', '222510': 'Jannali',
  '223310': 'Loftus', '223410': 'Engadine', '223420': 'Heathcote', '250810': 'Waterfall',
  '214510': 'Wentworthville', '214610': 'Pendle Hill', '214710': 'Toongabbie', '214820': 'Seven Hills',
  '214830': 'Marayong', '214840': 'Quakers Hill', '276310': 'Schofields', '276510': 'Riverstone',
  '275610': 'Mulgrave', '275620': 'Windsor', '275630': 'Richmond', '215110': 'North Rocks',
  '215310': 'Baulkham Hills', '215410': 'Castle Hill', '215510': 'Rouse Hill', '215520': 'Kellyville',
  '215530': 'Bella Vista', '215540': 'Norwest', '215320': 'Showground', '215330': 'Cherrybrook',
  '211910': 'Beecroft', '212010': 'Pennant Hills', '212020': 'Thornleigh', '207610': 'Normanhurst',
  '207720': 'Waitara', '207620': 'Wahroonga', '207630': 'Warrawee', '207410': 'Turramurra',
  '207310': 'Pymble', '207210': 'Gordon', '207110': 'Killara', '207010': 'Lindfield',
  '206910': 'Roseville', '206510': 'St Leonards', '206520': 'Wollstonecraft', '206020': 'Waverton',
  '206110': 'Milsons Point', '201010': 'Surry Hills', '201510': 'Alexandria', '201810': 'Rosebery',
  '219410': 'Campsie', '219310': 'Ashbury', '219210': 'Belmore', '219510': 'Lakemba',
  '219610': 'Wiley Park', '219910': 'Punchbowl', '220020': 'Yagoona', '214320': 'Birrong',
  '214330': 'Sefton', '216120': 'Chester Hill', '216220': 'Villawood', '216320': 'Carramar',
  '217910': 'Leppington', '217110': 'Edmondson Park', '217410': 'Glenfield', '217120': 'Macquarie Fields',
  '217130': 'Ingleburn', '217140': 'Minto', '217150': 'Leumeah', '256020': 'Macarthur',
  '214220': 'Granville', '215020': 'Harris Park', '214520': 'Westmead', '277010': 'Mount Druitt',
  '276010': 'St Marys', '274710': 'Werrington', '274720': 'Kingswood', '275020': 'Emu Plains',
  '214020': 'Flemington', '212710': 'Olympic Park', '250010': 'Wollongong', '230010': 'Newcastle Interchange'
};

const cleanRouteName = (trans: any) => {
  if (!trans) return "N/A";
  const disassembled = trans.disassembledName || "";
  const name = trans.name || "";
  const number = trans.number || "";
  const line = trans.properties?.line || "";
  
  if (line && /^[TBMFL]\d+$/.test(line)) return line;
  if (disassembled && /^[TBMFL]\d+$/.test(disassembled)) return disassembled;
  
  const allFields = [disassembled, name, number, line];
  for (const field of allFields) {
    if (field && typeof field === 'string') {
      if (field.includes('_')) {
        const prefix = field.split('_')[0];
        if (ROUTE_MAPPINGS[prefix]) return ROUTE_MAPPINGS[prefix];
      }
      // Check if field itself is a code like "T1"
      if (/^[TBMFL]\d+$/.test(field)) return field;
    }
  }
  
  if (number && /^[TBMFL]\d+$/.test(number)) return number;
  return (disassembled || name || number || "N/A").replace(/Line$/, '').replace(/Service$/, '').trim();
};

const cleanStopName = (loc: any, stationMap?: Record<string, string>) => {
  if (!loc) return "Unknown Stop";
  let id = "";
  let name = "";
  
  if (typeof loc === 'string') {
    id = loc.split("-")[0];
    name = stationMap?.[id] || STATION_NAMES[id] || loc;
  } else {
    id = (loc.id || "").split("-")[0];
    name = loc.disassembledName || loc.name || stationMap?.[id] || STATION_NAMES[id] || "";
    const parentName = loc.parent?.name || "";
    if ((!name || /^\d+$/.test(name)) && parentName) name = parentName;
  }
  
  if (!name || /^\d+$/.test(name)) {
    return stationMap?.[id] || STATION_NAMES[id] || ("Station " + (id || "N/A"));
  }
  
  return name.replace(/\s\[\d+\]$/, '').replace(/,\sSydney$/, '').replace(/,\sNSW$/, '').trim();
};

const cleanPlatform = (loc: any) => {
  if (!loc) return "N/A";
  
  // If loc is a string (GTFS-R stopId), try to extract platform suffix
  if (typeof loc === 'string') {
    const parts = loc.split("-");
    if (parts.length > 1) {
      const last = parts[parts.length - 1];
      if (last.length <= 3) return last;
    }
    return "N/A";
  }

  let p = loc.platform || loc.properties?.stopPostName || "";
  if (p.length > 5 && /^\d+$/.test(p)) p = loc.properties?.stopPostName || "";
  if (!p || p === "N/A") return "N/A";
  const match = p.match(/(?:Platform|Stand|Wharf|Stop|Bay)\s*([A-Z0-9]+)/i);
  return match ? match[1] : p;
};

export default function App() {
  const [originStation, setOriginStation] = useState<Station | null>(null);
  const [destinationStation, setDestinationStation] = useState<Station | null>(null);
  const [allStations, setAllStations] = useState<Station[]>([]);
  const [trains, setTrains] = useState<TrainUpdate[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'favorites'>('list');
  const [transportMode, setTransportMode] = useState<TransportMode>('train');
  const [trainsOnly, setTrainsOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(30);

  useEffect(() => {
    const fetchAllStations = async () => {
      const { data, error } = await supabase
        .from('stations')
        .select('*')
        .eq('location_type', 1)
        .order('stop_name');
      if (!error && data) setAllStations(data);
    };
    fetchAllStations();
  }, []);

  const fetchTrains = useCallback(async (origin: Station | null, destination: Station | null, mode: TransportMode, onlyTrains: boolean) => {
    setIsLoading(true);
    setError(null);
    try {
      const stationMap: Record<string, string> = {};
      allStations.forEach(s => {
        stationMap[s.stop_id] = s.stop_name;
      });

      let endpoint = `/api/network/live?mode=${mode}`;
      if (origin && destination) {
        endpoint = `/api/trip?origin=${origin.stop_id}&destination=${destination.stop_id}&mode=${mode}&trainsOnly=${onlyTrains}`;
      } else if (origin) {
        endpoint = `/api/departures?origin=${origin.stop_id}&mode=${mode}`;
      }
      
      const [trainResponse, vehicleResponse] = await Promise.all([
        fetch(endpoint),
        fetch('/api/vehicles')
      ]);

      if (!trainResponse.ok) throw new Error('Failed to fetch transit data');
      
      const trainData = await trainResponse.json();
      const vehicleData = await vehicleResponse.json().catch(() => []);

      let finalTrains: TrainUpdate[] = [];

      // If using /api/trip, we need to map the rapidJSON structure to our TrainUpdate type
      if (origin && destination) {
        const journeys = trainData.journeys || [];
        finalTrains = journeys.flatMap((j: any) => {
          // If onlyTrains is true, we still might have walking legs, but we want to find the main rail leg
          const leg = j.legs.find((l: any) => {
            const mot = l.transportation?.product?.class;
            return onlyTrains ? (mot === 1 || mot === 2) : (mot <= 10);
          });
          
          if (!leg) return [];
          
          const originStop = leg.stopSequence[0];
          const destStop = leg.stopSequence[leg.stopSequence.length - 1];
          
          const arrivalTime = Math.floor(new Date(originStop.departureTimePlanned || originStop.departureTimeEstimated).getTime() / 1000);
          const destArrivalTime = Math.floor(new Date(destStop.arrivalTimePlanned || destStop.arrivalTimeEstimated).getTime() / 1000);
          const now = Math.floor(Date.now() / 1000);

          return [{
            tripId: leg.transportation.properties.tripCode || leg.transportation.number,
            routeId: leg.transportation.number,
            routeName: cleanRouteName(leg.transportation),
            destination: cleanStopName(leg.destination.name || leg.destination, stationMap),
            stopId: originStop.id,
            stopName: cleanStopName(originStop, stationMap),
            arrivalTime: arrivalTime,
            destArrivalTime: destArrivalTime,
            duration: Math.round((destArrivalTime - arrivalTime) / 60),
            minutesUntil: Math.round((arrivalTime - now) / 60),
            delay: 0, // Simplified for now
            platform: cleanPlatform(originStop),
            mode: mode,
            mot: leg.transportation.product.class,
            legs: j.legs
          }];
        });
      } else {
        // For /api/network/trains and /api/departures, the server already returns TrainUpdate[]
        // But we apply a second layer of cleaning here using our dynamic stationMap
        finalTrains = (trainData as any[]).map(t => ({
          ...t,
          stopName: cleanStopName(t.stopId, stationMap),
          destination: t.destination === "Sydney" || /^\d+$/.test(t.destination) ? (stationMap[t.destinationId] || t.destination) : t.destination,
          platform: cleanPlatform(t.stopId)
        }));
      }

      setTrains(finalTrains);
      
      setVehicles(vehicleData);
      setLastUpdated(new Date());
      setCountdown(30);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrains(originStation, destinationStation, transportMode, trainsOnly);
  }, [originStation, destinationStation, transportMode, trainsOnly, fetchTrains]);

  // Auto-refresh logic
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!isLoading) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchTrains(originStation, destinationStation, transportMode, trainsOnly);
            return 30;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [originStation, destinationStation, transportMode, trainsOnly, isLoading, fetchTrains]);

  const handleStationSelect = (station: Station, type: 'origin' | 'destination') => {
    if (type === 'origin') {
      setOriginStation(station);
    } else {
      setDestinationStation(station);
    }
    setActiveTab('list');
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-neon-green/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      <main className="relative z-10 container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 space-y-4"
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 glass rounded-full text-neon-green text-sm font-bold tracking-widest uppercase">
            <div className="w-2 h-2 rounded-full bg-neon-green pulse-green" />
            Universal Sydney Transit
          </div>
          <h1 className="text-5xl md:text-6xl font-black tracking-tighter bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
            SYDNEY GO
          </h1>
        </motion.header>

        {/* Mode Selector */}
        <div className="flex flex-col items-center gap-6 mb-8">
          <div className="flex flex-wrap items-center justify-center gap-3">
            {[
              { id: 'train', icon: '🚆', label: 'Train' },
              { id: 'bus', icon: '🚌', label: 'Bus' },
              { id: 'ferry', icon: '⛴️', label: 'Ferry' },
              { id: 'lightrail', icon: '🚃', label: 'Light Rail' },
              { id: 'metro', icon: '🚇', label: 'Metro' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setTransportMode(mode.id as TransportMode)}
                className={cn(
                  "px-4 py-2 glass rounded-xl text-sm font-bold transition-all flex items-center gap-2",
                  transportMode === mode.id ? "bg-neon-green text-midnight shadow-lg shadow-neon-green/20" : "text-white/40 hover:text-white"
                )}
              >
                <span>{mode.icon}</span>
                <span>{mode.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setTrainsOnly(!trainsOnly)}
            className={cn(
              "flex items-center gap-3 px-6 py-2.5 rounded-full border transition-all font-bold text-sm",
              trainsOnly 
                ? "bg-orange-500/20 border-orange-500 text-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                : "bg-white/5 border-white/10 text-white/40 hover:text-white"
            )}
          >
            <div className={cn(
              "w-2 h-2 rounded-full",
              trainsOnly ? "bg-orange-500 animate-pulse" : "bg-white/20"
            )} />
            {trainsOnly ? "Trains Only Active" : "Filter: All Transport"}
          </button>
        </div>

        {/* Search Section */}
        <section className="mb-12 space-y-4">
          <AnimatePresence mode="wait">
            {!originStation ? (
              <motion.div
                key="origin-search"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <StationSearch 
                  label="Origin Station" 
                  placeholder="Where are you starting?" 
                  onSelect={handleStationSelect} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="destination-flow"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Origin Pill */}
                <div className="flex items-center justify-between px-6 py-3 bg-midnight/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-neon-green pulse-green" />
                    <div>
                      <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Starting From</div>
                      <div className="text-lg font-bold text-white">{originStation.stop_name}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setOriginStation(null);
                      setDestinationStation(null);
                    }}
                    className="p-2 text-white/40 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Destination Search */}
                <StationSearch 
                  label="Destination" 
                  placeholder="Where to?" 
                  onSelect={handleStationSelect} 
                  autoFocus={true}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mb-8 p-1 glass rounded-2xl w-fit mx-auto">
          <button
            onClick={() => setActiveTab('list')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'list' ? "bg-neon-green text-midnight shadow-lg shadow-neon-green/20" : "text-white/40 hover:text-white"
            )}
          >
            <Train className="w-4 h-4" />
            Departures
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'map' ? "bg-neon-green text-midnight shadow-lg shadow-neon-green/20" : "text-white/40 hover:text-white"
            )}
          >
            <MapIcon className="w-4 h-4" />
            Live Map
          </button>
          <button
            onClick={() => setActiveTab('favorites')}
            className={cn(
              "px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2",
              activeTab === 'favorites' ? "bg-neon-green text-midnight shadow-lg shadow-neon-green/20" : "text-white/40 hover:text-white"
            )}
          >
            <Bookmark className="w-4 h-4" />
            Favorites
          </button>
        </div>

        {/* Content Section */}
        <section className="space-y-6">
          <AnimatePresence mode="wait">
            {activeTab === 'list' && (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Controls & Status */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-2">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold">
                      {originStation ? (
                        <span>
                          {originStation.stop_name}
                          {destinationStation && <span className="text-white/30 mx-2">→</span>}
                          {destinationStation?.stop_name}
                        </span>
                      ) : "Global Network Departures"}
                    </h2>
                    {lastUpdated && (
                      <span className="text-xs font-mono text-white/30 uppercase tracking-widest">
                        Updated {lastUpdated.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {(originStation || destinationStation) && (
                      <button
                        onClick={() => {
                          setOriginStation(null);
                          setDestinationStation(null);
                        }}
                        className="px-4 py-2 text-sm font-medium glass rounded-xl glass-hover text-white/60 hover:text-white transition-all"
                      >
                        Reset
                      </button>
                    )}
                    <div className="text-right mr-2">
                      <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Next Refresh</div>
                      <div className="text-sm font-mono text-neon-green">{countdown}s</div>
                    </div>
                    <button
                      onClick={() => fetchTrains(originStation, destinationStation, transportMode, trainsOnly)}
                      disabled={isLoading}
                      className={cn(
                        "p-3 glass rounded-xl glass-hover text-white/60 hover:text-neon-green transition-all",
                        isLoading && "animate-spin text-neon-green"
                      )}
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Error State */}
                {error && (
                  <div className="p-4 glass border-red-500/30 bg-red-500/5 rounded-2xl flex items-center gap-3 text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <p>{error}</p>
                  </div>
                )}

                {/* Train List */}
                <div className="grid gap-4">
                  {trains.length > 0 ? (
                    trains.map((train, index) => (
                      <div 
                        key={train.tripId + train.stopId} 
                        onClick={() => {
                          setSelectedTripId(train.tripId);
                          setActiveTab('map');
                        }}
                        className="cursor-pointer"
                      >
                        <TrainCard 
                          train={train} 
                          index={index} 
                          originName={originStation?.stop_name}
                          destinationName={destinationStation?.stop_name}
                          destinationId={destinationStation?.stop_id}
                          hasLivePosition={vehicles.some(v => v.tripId === train.tripId)}
                        />
                      </div>
                    ))
                  ) : !isLoading && (
                    <div className="text-center py-12 glass rounded-2xl border-dashed border-white/10 text-white/30">
                      No upcoming services found.
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <div className="mb-4 flex items-center justify-between px-2">
                  <h2 className="text-2xl font-bold">Live Network Map</h2>
                  {selectedTripId && (
                    <button 
                      onClick={() => setSelectedTripId(null)}
                      className="text-xs text-neon-green hover:underline"
                    >
                      Clear Highlight
                    </button>
                  )}
                </div>
                <MapComponent 
                  selectedTripId={selectedTripId} 
                  activeTripIds={trains.map(t => t.tripId)}
                />
              </motion.div>
            )}

            {activeTab === 'favorites' && (
              <motion.div
                key="favorites"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <FavoriteTrips 
                  stations={allStations} 
                  onSelectStation={(station) => {
                    setOriginStation(station);
                    setActiveTab('list');
                  }} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Footer */}
        <footer className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 text-white/20 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-green" />
            Powered by TfNSW Open Data
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors flex items-center gap-2">
              <Github className="w-4 h-4" />
              Source
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
