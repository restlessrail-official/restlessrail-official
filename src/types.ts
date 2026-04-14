export interface Station {
  stop_id: string;
  stop_name: string;
  location_type?: number;
  mot?: number;
}

export type TransportMode = 'train' | 'bus' | 'ferry' | 'lightrail' | 'metro';

export interface TrainUpdate {
  tripId: string;
  routeId: string;
  routeName?: string;
  destination: string;
  stopId: string;
  stopName?: string;
  arrivalTime: number;
  destArrivalTime?: number;
  duration?: number;
  minutesUntil: number;
  delay: number;
  platform: string;
  mode?: TransportMode;
  mot?: number;
  legs?: any[];
}
