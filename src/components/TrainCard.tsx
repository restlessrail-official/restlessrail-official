import React from 'react';
import { motion } from 'motion/react';
import { Clock, MapPin, Navigation, BookmarkPlus, Train as TrainIcon, Bus, Anchor, TramFront, Footprints, Ship, ArrowRight, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { TrainUpdate } from '../types';
import { supabase } from '../lib/supabase';

interface TrainCardProps {
  train: TrainUpdate;
  index: number;
  originName?: string;
  destinationName?: string;
  destinationId?: string;
  hasLivePosition?: boolean;
}

const getTransportType = (mot?: number) => {
  switch (mot) {
    case 1:
    case 2: return 'TRAIN';
    case 3: return 'METRO';
    case 4: return 'LIGHT_RAIL';
    case 5: return 'BUS';
    case 9: return 'FERRY';
    case 100: return 'WALK';
    default: return 'TRAIN';
  }
};

const getModeIcon = (mot?: number) => {
  const type = getTransportType(mot);
  switch (type) {
    case 'TRAIN': return <TrainIcon className="w-5 h-5" />;
    case 'METRO': return <TrainIcon className="w-5 h-5" />; // Metro icon?
    case 'BUS': return <Bus className="w-5 h-5" />;
    case 'FERRY': return <Ship className="w-5 h-5" />;
    case 'LIGHT_RAIL': return <TramFront className="w-5 h-5" />;
    case 'WALK': return <Footprints className="w-5 h-5" />;
    default: return <TrainIcon className="w-5 h-5" />;
  }
};

const getModeEmoji = (mot?: number) => {
  const type = getTransportType(mot);
  switch (type) {
    case 'TRAIN': return '🚆';
    case 'METRO': return '🚇';
    case 'BUS': return '🚌';
    case 'FERRY': return '⛴️';
    case 'LIGHT_RAIL': return '🚃';
    case 'WALK': return '🚶';
    default: return '🚆';
  }
};

const getModeColor = (mot?: number) => {
  const type = getTransportType(mot);
  switch (type) {
    case 'TRAIN': return 'text-orange-500';
    case 'METRO': return 'text-teal-400';
    case 'LIGHT_RAIL': return 'text-red-400';
    case 'BUS': return 'text-blue-400';
    case 'FERRY': return 'text-green-400';
    case 'WALK': return 'text-white/20';
    default: return 'text-neon-green';
  }
};

const getModeBorder = (mot?: number) => {
  const type = getTransportType(mot);
  switch (type) {
    case 'TRAIN': return 'border-l-4 border-l-orange-500';
    case 'METRO': return 'border-l-4 border-l-teal-500';
    case 'LIGHT_RAIL': return 'border-l-4 border-l-red-500';
    case 'BUS': return 'border-l-4 border-l-blue-500';
    case 'FERRY': return 'border-l-4 border-l-green-500';
    case 'WALK': return 'border-l-4 border-l-white/10';
    default: return 'border-l-4 border-l-neon-green';
  }
};

const getTimelineDot = (mot?: number) => {
  const type = getTransportType(mot);
  switch (type) {
    case 'TRAIN': return 'bg-orange-500';
    case 'METRO': return 'bg-teal-500';
    case 'LIGHT_RAIL': return 'bg-red-500';
    case 'BUS': return 'bg-blue-500';
    case 'FERRY': return 'bg-green-500';
    case 'WALK': return 'bg-white/10';
    default: return 'bg-white/20';
  }
};

const getStopLabel = (mot?: number) => {
  const type = getTransportType(mot);
  switch (type) {
    case 'TRAIN':
    case 'METRO': return 'Platform';
    case 'BUS': return 'Stand';
    case 'FERRY': return 'Wharf';
    case 'LIGHT_RAIL': return 'Stop';
    default: return 'Platform';
  }
};

const getRouteColor = (routeName?: string, mot?: number) => {
  if (!routeName) return getModeColor(mot);
  
  const name = routeName.toUpperCase();
  if (name.startsWith('T1')) return 'text-orange-500';
  if (name.startsWith('T2')) return 'text-blue-500';
  if (name.startsWith('T3')) return 'text-orange-400';
  if (name.startsWith('T4')) return 'text-blue-400';
  if (name.startsWith('T5')) return 'text-fuchsia-500';
  if (name.startsWith('T7')) return 'text-slate-400';
  if (name.startsWith('T8')) return 'text-green-600';
  if (name.startsWith('T9')) return 'text-red-600';
  if (name.startsWith('METRO')) return 'text-teal-400';
  if (name.startsWith('BMT')) return 'text-yellow-500';
  if (name.startsWith('CCN')) return 'text-red-500';
  if (name.startsWith('SCO')) return 'text-blue-600';
  if (name.startsWith('SHL')) return 'text-green-500';
  if (name.startsWith('HUN')) return 'text-red-400';
  
  return getModeColor(mot);
};

const getRouteBorder = (routeName?: string, mot?: number) => {
  if (!routeName) return getModeBorder(mot);
  
  const name = routeName.toUpperCase();
  if (name.startsWith('T1')) return 'border-l-4 border-l-orange-500';
  if (name.startsWith('T2')) return 'border-l-4 border-l-blue-500';
  if (name.startsWith('T3')) return 'border-l-4 border-l-orange-400';
  if (name.startsWith('T4')) return 'border-l-4 border-l-blue-400';
  if (name.startsWith('T5')) return 'border-l-4 border-l-fuchsia-500';
  if (name.startsWith('T7')) return 'border-l-4 border-l-slate-400';
  if (name.startsWith('T8')) return 'border-l-4 border-l-green-600';
  if (name.startsWith('T9')) return 'border-l-4 border-l-red-600';
  if (name.startsWith('METRO')) return 'border-l-4 border-l-teal-400';
  if (name.startsWith('BMT')) return 'border-l-4 border-l-yellow-500';
  if (name.startsWith('CCN')) return 'border-l-4 border-l-red-500';
  if (name.startsWith('SCO')) return 'border-l-4 border-l-blue-600';
  if (name.startsWith('SHL')) return 'border-l-4 border-l-green-500';
  if (name.startsWith('HUN')) return 'border-l-4 border-l-red-400';
  
  return getModeBorder(mot);
};

const getRouteBg = (routeName?: string, mot?: number) => {
  if (!routeName) return getTimelineDot(mot);
  
  const name = routeName.toUpperCase();
  if (name.startsWith('T1')) return 'bg-orange-500';
  if (name.startsWith('T2')) return 'bg-blue-500';
  if (name.startsWith('T3')) return 'bg-orange-400';
  if (name.startsWith('T4')) return 'bg-blue-400';
  if (name.startsWith('T5')) return 'bg-fuchsia-500';
  if (name.startsWith('T7')) return 'bg-slate-400';
  if (name.startsWith('T8')) return 'bg-green-600';
  if (name.startsWith('T9')) return 'bg-red-600';
  if (name.startsWith('METRO')) return 'bg-teal-400';
  if (name.startsWith('BMT')) return 'bg-yellow-500';
  if (name.startsWith('CCN')) return 'bg-red-500';
  if (name.startsWith('SCO')) return 'bg-blue-600';
  if (name.startsWith('SHL')) return 'bg-green-500';
  if (name.startsWith('HUN')) return 'bg-red-400';
  
  return getTimelineDot(mot);
};

export default function TrainCard({ train, index, originName, destinationName, destinationId, hasLivePosition }: TrainCardProps) {
  const isOnTime = train.delay <= 60; // Less than 1 minute delay is "on time"

  const handleSaveTrip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please sign in to save trips');
        return;
      }

      // Using the requested fields: origin_id, destination_id, mode
      const { error } = await supabase
        .from('user_trips')
        .insert({
          user_id: user.id,
          origin_id: train.stopId, 
          destination_id: destinationId || train.destination,
          origin_name: originName || 'Origin',
          destination_name: destinationName || train.destination,
          mode: train.mode || 'train'
        });

      if (error) throw error;
      alert('Trip saved to favorites!');
    } catch (err: any) {
      console.error('Error saving trip:', err);
      alert('Failed to save trip');
    }
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5, ease: "easeOut" }}
      className={cn(
        "glass glass-hover rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group relative overflow-hidden",
        getRouteBorder(train.routeName, train.mot)
      )}
    >
      {/* Background Glow */}
      <div className={cn(
        "absolute -left-20 -top-20 w-40 h-40 blur-[100px] opacity-20 transition-opacity group-hover:opacity-30",
        getRouteBg(train.routeName, train.mot)
      )} />

      <div className="flex items-start gap-4 flex-1">
        <div className="mt-1 flex flex-col items-center gap-2">
          <div className={cn(
            "w-3 h-3 rounded-full",
            isOnTime ? "bg-neon-green pulse-green" : "bg-orange-500"
          )} />
          <div className={cn("p-2 rounded-lg bg-white/5", getRouteColor(train.routeName, train.mot))}>
            {getModeIcon(train.mot)}
          </div>
        </div>
        
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <span className={cn(
                "text-sm px-2 py-0.5 rounded-md bg-white/10 border border-white/20 font-black uppercase",
                getRouteColor(train.routeName, train.mot)
              )}>
                {train.routeName || train.routeId}
              </span>
              <span>to {train.destination}</span>
            </h3>
          </div>
          <div className="flex items-center gap-4 text-sm text-white/50">
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <div className="flex items-baseline gap-1.5">
                <span className="font-medium text-white/80 text-lg">{train.stopName || originName || train.stopId}</span>
                <span className={cn(
                  "text-xs font-bold uppercase tracking-wider opacity-70",
                  getRouteColor(train.routeName, train.mot)
                )}>
                  {getStopLabel(train.mot)} {train.platform}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <Navigation className="w-4 h-4" />
              <span>{isOnTime ? "On Time" : `${Math.round(train.delay / 60)}m Late`}</span>
            </div>
            {train.duration && (
              <div className="flex items-center gap-1.5 text-neon-green font-bold">
                <Clock className="w-4 h-4" />
                <span>{train.duration} min trip</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={handleSaveTrip}
          className="p-3 glass rounded-xl text-white/40 hover:text-neon-green hover:border-neon-green/50 transition-all"
          title="Save Trip"
        >
          <BookmarkPlus className="w-5 h-5" />
        </button>

        <div className="text-right">
          <div className="text-4xl font-black tracking-tighter text-white flex items-center justify-end gap-2">
            {hasLivePosition && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/20 text-neon-green border border-neon-green/30 animate-pulse flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                LIVE
              </span>
            )}
            {train.minutesUntil <= 0 ? "NOW" : `${train.minutesUntil}`}
            {train.minutesUntil > 0 && <span className="text-sm font-medium ml-1 text-white/40">min</span>}
          </div>
          <div className="text-xs text-white/30 font-mono flex flex-col items-end gap-0.5 mt-1">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Est: {new Date(train.arrivalTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            {train.destArrivalTime && (
              <div className="text-[9px] opacity-50">
                Arr: {new Date(train.destArrivalTime * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>
      </div>

      {train.legs && train.legs.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Journey Overview</div>
            <div className="text-[10px] text-neon-green uppercase tracking-widest font-bold">
              {(train.legs?.length || 1) - 1} Transfers • {train.legs.reduce((acc: number, leg: any) => acc + (leg.stopSequence?.length || 0), 0)} Stops
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {train.legs.map((leg: any, i: number) => {
              const origin = leg.stopSequence?.[0];
              const destination = leg.stopSequence?.[leg.stopSequence?.length - 1];
              const isWalk = leg.transportation?.product?.class === 100;

              return (
                <React.Fragment key={i}>
                  <div className="flex items-center gap-3 px-4 py-2 glass rounded-xl text-xs relative overflow-hidden group/leg">
                    <div className={cn("absolute left-0 top-0 bottom-0 w-1", getTimelineDot(leg.transportation?.product?.class))} />
                    <span className="text-xl">
                      {getModeEmoji(leg.transportation?.product?.class)}
                    </span>
                    <div className="flex flex-col">
                      <span className="font-bold text-white/90">
                        {isWalk ? "Walk" : (leg.transportation.disassembledName || leg.transportation.name)}
                      </span>
                      <div className="flex items-center gap-2 text-[9px] text-white/40 uppercase font-bold">
                        <span>{Math.round(leg.duration / 60)}m</span>
                        {!isWalk && origin?.properties?.stopPostName && (
                          <span className="text-neon-green">Stand {origin.properties.stopPostName}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {i < train.legs.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-white/20" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-white/20 italic">
            <Info className="w-3 h-3" />
            Click for full step-by-step directions and live map
          </div>
        </div>
      )}
    </motion.div>
  );
}
