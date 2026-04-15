import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Train, X, Bus, Anchor, TramFront, Footprints } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Station } from '../types';

interface StationSearchProps {
  onSelect: (station: Station, type: 'origin' | 'destination') => void;
  label: string;
  placeholder: string;
  id?: string;
  autoFocus?: boolean;
}

export default function StationSearch({ onSelect, label, placeholder, id, autoFocus }: StationSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchStations = async () => {
      if (query.length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch(`/api/stop-finder?name_sf=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        if (data && data.locations) {
          const stations: Station[] = data.locations
            .filter((loc: any) => loc.type === 'stop' || loc.type === 'any')
            .map((loc: any) => {
              // Try to find the primary MOT (Mode of Transport)
              const mot = loc.modes?.[0] || (loc.productClasses?.[0] === 1 ? 1 : loc.productClasses?.[0]);
              return {
                stop_id: loc.id,
                stop_name: loc.name,
                location_type: 1,
                mot: mot
              };
            });
          
          // Deduplication: Remove duplicate IDs, but keep if mode is different
          const uniqueStations = stations.filter((v, i, a) => 
            a.findIndex(t => t.stop_id === v.stop_id && t.mot === v.mot) === i
          );
          
          setResults(uniqueStations);
          setIsOpen(true);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(fetchStations, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div ref={containerRef} className="relative w-full z-50">
      <div className="text-xs font-bold text-white/30 uppercase tracking-widest mb-2 ml-2">{label}</div>
      <div className="relative group">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-white/40 group-focus-within:text-neon-green transition-colors" />
        </div>
        <input
          id={id}
          autoFocus={autoFocus}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-12 py-4 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-neon-green/50 transition-all text-lg placeholder:text-white/30"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-4 flex items-center text-white/40 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute w-full mt-2 glass rounded-2xl overflow-hidden shadow-2xl z-50"
          >
            {results.map((station, index) => (
              <button
                key={`${station.stop_id}-${station.mot || ''}-${index}`}
                onClick={() => {
                  onSelect(station, label.toLowerCase().includes('origin') ? 'origin' : 'destination');
                  setQuery(station.stop_name);
                  setIsOpen(false);
                }}
                className="w-full px-6 py-4 flex items-center gap-4 hover:bg-white/10 transition-colors text-left border-b border-white/5 last:border-none"
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  station.mot === 1 || station.mot === 2 ? "bg-orange-500/10 text-orange-500" :
                  station.mot === 3 ? "bg-teal-500/10 text-teal-500" :
                  station.mot === 4 ? "bg-red-500/10 text-red-500" :
                  station.mot === 5 ? "bg-blue-500/10 text-blue-500" :
                  station.mot === 9 ? "bg-green-500/10 text-green-500" :
                  "bg-neon-green/10 text-neon-green"
                )}>
                  {station.mot === 1 || station.mot === 2 ? <Train className="w-5 h-5" /> :
                   station.mot === 3 ? <Train className="w-5 h-5" /> : // Metro icon?
                   station.mot === 4 ? <TramFront className="w-5 h-5" /> :
                   station.mot === 5 ? <Bus className="w-5 h-5" /> :
                   station.mot === 9 ? <Anchor className="w-5 h-5" /> :
                   <Train className="w-5 h-5" />}
                </div>
                <div>
                  <div className="font-medium text-white">{station.stop_name}</div>
                  <div className="text-xs text-white/40 uppercase tracking-wider">Stop ID: {station.stop_id}</div>
                </div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
