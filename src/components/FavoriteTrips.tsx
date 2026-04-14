import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Station } from '../types';
import { Bookmark, Plus, Trash2, ArrowRight, Play } from 'lucide-react';
import { cn } from '../lib/utils';

interface FavoriteTripsProps {
  onSelectStation: (station: Station) => void;
  stations: Station[];
}

interface UserTrip {
  id: string;
  origin_id: string;
  destination_id: string;
  origin_name: string;
  destination_name: string;
}

export const FavoriteTrips: React.FC<FavoriteTripsProps> = ({ onSelectStation, stations }) => {
  const [favorites, setFavorites] = useState<UserTrip[]>([]);
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchFavorites = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('user_trips')
      .select('*')
      .eq('user_id', user.id);

    if (error) {
      console.error('Error fetching favorites:', error);
    } else {
      setFavorites(data || []);
    }
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login to save trips');

      const originStation = stations.find(s => s.stop_id === origin);
      const destStation = stations.find(s => s.stop_id === destination);

      const { error } = await supabase
        .from('user_trips')
        .insert({
          user_id: user.id,
          origin_id: origin,
          destination_id: destination,
          origin_name: originStation?.stop_name || origin,
          destination_name: destStation?.stop_name || destination
        });

      if (error) throw error;
      
      setOrigin('');
      setDestination('');
      fetchFavorites();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('user_trips')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting favorite:', error);
    } else {
      fetchFavorites();
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-2xl p-6 border border-white/10">
        <div className="flex items-center gap-2 mb-4">
          <Bookmark className="w-5 h-5 text-neon-green" />
          <h3 className="text-lg font-bold">Save Favorite Trip</h3>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="bg-midnight/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-green"
          >
            <option value="">Select Origin</option>
            {stations.map(s => (
              <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>
            ))}
          </select>

          <select
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="bg-midnight/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-neon-green"
          >
            <option value="">Select Destination</option>
            {stations.map(s => (
              <option key={s.stop_id} value={s.stop_id}>{s.stop_name}</option>
            ))}
          </select>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-neon-green text-midnight font-bold rounded-xl px-4 py-2 text-sm hover:bg-neon-green/80 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Plus className="w-4 h-4" />
            Save Trip
          </button>
        </form>
      </div>

      {favorites.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="glass rounded-2xl p-4 border border-white/10 flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className="text-sm">
                  <span className="font-bold">{fav.origin_name}</span>
                  <ArrowRight className="w-3 h-3 inline mx-2 text-white/30" />
                  <span className="text-white/60">{fav.destination_name}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const station = stations.find(s => s.stop_id === fav.origin_id);
                    if (station) onSelectStation(station);
                  }}
                  className="p-2 bg-neon-green/10 text-neon-green rounded-lg hover:bg-neon-green/20 transition-all"
                  title="Quick Start"
                >
                  <Play className="w-4 h-4 fill-current" />
                </button>
                <button
                  onClick={() => handleDelete(fav.id)}
                  className="p-2 text-white/20 hover:text-red-400 transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
