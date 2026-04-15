import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Clock, MapPin, Navigation, ArrowRight, Footprints, Train, Bus, Ship, TramFront, Info, ChevronRight, Map as MapIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { TrainUpdate } from '../types';
import { MapComponent } from './MapComponent';

interface TripOverviewProps {
  trip: TrainUpdate;
  onClose: () => void;
}

const getModeIcon = (mot?: number) => {
  switch (mot) {
    case 1:
    case 2: return <Train className="w-5 h-5" />;
    case 3: return <Train className="w-5 h-5" />; // Metro
    case 4: return <Bus className="w-5 h-5" />;
    case 5: return <Bus className="w-5 h-5" />;
    case 6: return <Ship className="w-5 h-5" />;
    case 7: return <Bus className="w-5 h-5" />;
    case 9: return <Ship className="w-5 h-5" />;
    case 100: return <Footprints className="w-5 h-5" />;
    default: return <Train className="w-5 h-5" />;
  }
};

const getModeColor = (mot?: number) => {
  switch (mot) {
    case 1:
    case 2: return 'text-orange-500';
    case 3: return 'text-teal-400';
    case 4:
    case 5:
    case 7: return 'text-blue-400';
    case 6:
    case 9: return 'text-green-400';
    case 100: return 'text-white/40';
    default: return 'text-neon-green';
  }
};

const getModeBg = (mot?: number) => {
  switch (mot) {
    case 1:
    case 2: return 'bg-orange-500';
    case 3: return 'bg-teal-400';
    case 4:
    case 5:
    case 7: return 'bg-blue-400';
    case 6:
    case 9: return 'bg-green-400';
    case 100: return 'bg-white/20';
    default: return 'bg-neon-green';
  }
};

export default function TripOverview({ trip, onClose }: TripOverviewProps) {
  const totalDuration = trip.duration || 0;
  const arrivalDate = new Date(trip.arrivalTime * 1000);
  const destArrivalDate = trip.destArrivalTime ? new Date(trip.destArrivalTime * 1000) : null;

  // Extract path for map
  const tripPath: [number, number][] = trip.legs?.flatMap((leg: any) => 
    leg.stopSequence?.map((stop: any) => {
      if (stop.coord && stop.coord.length >= 2) {
        return [stop.coord[0], stop.coord[1]] as [number, number];
      }
      return null;
    }).filter(Boolean) || []
  ) || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 50 }}
      className="fixed inset-0 z-[2000] bg-midnight/95 backdrop-blur-xl flex flex-col"
    >
      {/* Header */}
      <header className="p-6 border-b border-white/10 flex items-center justify-between glass">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="p-2 glass rounded-xl glass-hover text-white/60 hover:text-white transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Trip Details</h2>
            <p className="text-sm text-white/40 font-mono uppercase tracking-widest">
              {trip.tripId} • {trip.routeName || trip.routeId}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="text-right">
            <div className="text-xs text-white/30 uppercase tracking-widest font-bold">Total Duration</div>
            <div className="text-xl font-black text-neon-green">{totalDuration} min</div>
          </div>
        </div>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="max-w-4xl mx-auto p-6 space-y-8">
          
          {/* Map Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <MapIcon className="w-5 h-5 text-neon-green" />
                Live Journey Map
              </h3>
            </div>
            <div className="h-[300px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <MapComponent 
                selectedTripId={trip.tripId} 
                activeTripIds={[trip.tripId]} 
                tripPath={tripPath}
              />
            </div>
          </section>

          {/* Itinerary Section */}
          <section className="space-y-6">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Navigation className="w-5 h-5 text-neon-green" />
              Detailed Itinerary
            </h3>

            <div className="space-y-0 relative">
              {/* Vertical Line */}
              <div className="absolute left-[21px] top-8 bottom-8 w-[2px] bg-white/5" />

              {trip.legs?.map((leg: any, index: number) => {
                const isWalk = leg.transportation?.product?.class === 100;
                const origin = leg.stopSequence[0];
                const destination = leg.stopSequence[leg.stopSequence.length - 1];
                const depTime = new Date(origin.departureTimePlanned || origin.departureTimeEstimated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const arrTime = new Date(destination.arrivalTimePlanned || destination.arrivalTimeEstimated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const legDuration = Math.round(leg.duration / 60);

                return (
                  <div key={index} className="relative pl-12 pb-10 last:pb-0">
                    {/* Dot */}
                    <div className={cn(
                      "absolute left-[14px] top-2 w-4 h-4 rounded-full border-4 border-midnight z-10",
                      getModeBg(leg.transportation?.product?.class)
                    )} />

                    <div className="glass rounded-2xl p-5 space-y-4 border border-white/5 hover:border-white/10 transition-all">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("p-2 rounded-lg bg-white/5", getModeColor(leg.transportation?.product?.class))}>
                            {getModeIcon(leg.transportation?.product?.class)}
                          </div>
                          <div>
                            <div className="text-sm font-bold text-white/80">
                              {isWalk ? "Walk" : `${leg.transportation.disassembledName || leg.transportation.name}`}
                            </div>
                            <div className="text-xs text-white/40">
                              {legDuration} min journey
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-white/60">{depTime}</div>
                          <div className="text-[10px] text-white/20 uppercase font-bold">Departure</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5" />
                          <div>
                            <div className="text-sm font-medium text-white/90">{origin.name || origin.disassembledName}</div>
                            {origin.properties?.stopPostName && (
                              <div className="text-[10px] text-neon-green font-bold uppercase tracking-wider">
                                {origin.properties.stopPostName}
                              </div>
                            )}
                          </div>
                        </div>

                        {!isWalk && leg.stopSequence.length > 2 && (
                          <div className="pl-4 py-2 space-y-2 border-l border-white/5 ml-0.5">
                            <details className="group/stops">
                              <summary className="text-[10px] text-white/30 hover:text-white/60 transition-colors uppercase tracking-widest font-bold flex items-center gap-1 cursor-pointer list-none">
                                <ChevronRight className="w-3 h-3 group-open/stops:rotate-90 transition-transform" />
                                Show {leg.stopSequence.length - 2} intermediate stops
                              </summary>
                              <div className="mt-2 space-y-2 pl-2">
                                {leg.stopSequence.slice(1, -1).map((stop: any, si: number) => (
                                  <div key={si} className="flex items-center gap-2 text-[10px] text-white/40">
                                    <div className="w-1 h-1 rounded-full bg-white/20" />
                                    <span>{stop.name || stop.disassembledName}</span>
                                  </div>
                                ))}
                              </div>
                            </details>
                          </div>
                        )}

                        <div className="flex items-start gap-3">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/20 mt-1.5" />
                          <div>
                            <div className="text-sm font-medium text-white/90">{destination.name || destination.disassembledName}</div>
                            <div className="text-xs text-white/40 font-mono">{arrTime} Arrival</div>
                          </div>
                        </div>
                      </div>

                      {index < (trip.legs?.length || 0) - 1 && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2 text-[10px] text-white/30 font-bold uppercase tracking-widest">
                          <Info className="w-3 h-3" />
                          Transfer at {destination.name || destination.disassembledName}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Summary Footer */}
          <section className="glass rounded-3xl p-8 border border-neon-green/20 bg-neon-green/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Train className="w-24 h-24 text-neon-green" />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-neon-green/20 text-neon-green">
                  <Clock className="w-8 h-8" />
                </div>
                <div>
                  <div className="text-sm text-white/40 uppercase tracking-widest font-bold">Estimated Arrival</div>
                  <div className="text-3xl font-black text-white">
                    {destArrivalDate?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 glass rounded-2xl">
                  <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Total Distance</div>
                  <div className="text-lg font-bold">-- km</div>
                </div>
                <div className="p-4 glass rounded-2xl">
                  <div className="text-[10px] text-white/30 uppercase font-bold mb-1">CO2 Saved</div>
                  <div className="text-lg font-bold text-neon-green">-- kg</div>
                </div>
                <div className="p-4 glass rounded-2xl">
                  <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Transfers</div>
                  <div className="text-lg font-bold">{(trip.legs?.length || 1) - 1}</div>
                </div>
                <div className="p-4 glass rounded-2xl">
                  <div className="text-[10px] text-white/30 uppercase font-bold mb-1">Status</div>
                  <div className="text-lg font-bold text-neon-green">On Time</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </motion.div>
  );
}
