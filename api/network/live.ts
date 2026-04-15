import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, getFeedMessage, cleanRouteName, cleanStopName, cleanPlatform, STATION_NAMES, setCorsHeaders } from '../lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const mode = (req.query.mode as string) || 'train';
  
  const URL_MAP: Record<string, string> = {
    'train': "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains",
    'bus': "https://api.transport.nsw.gov.au/v1/gtfs/realtime/buses",
    'ferry': "https://api.transport.nsw.gov.au/v1/gtfs/realtime/ferries",
    'light_rail': "https://api.transport.nsw.gov.au/v1/gtfs/realtime/lightrail/",
    'metro': "https://api.transport.nsw.gov.au/v2/gtfs/realtime/metro"
  };

  const url = URL_MAP[mode] || URL_MAP['train'];
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `apikey ${TFNSW_API_KEY}`,
        Accept: "application/x-google-protobuf",
      },
      responseType: "arraybuffer",
    });

    const FeedMessage = await getFeedMessage();
    let message;
    try {
      message = FeedMessage.decode(new Uint8Array(response.data));
    } catch (decodeError: any) {
      return res.status(500).json({ error: "Protobuf Decode Failed", type: decodeError.name });
    }

    const feed = FeedMessage.toObject(message, {
      enums: String,
      longs: String,
    }) as any;

    const entities = feed.entity || [];
    const trainUpdates = entities
      .flatMap((entity: any) => {
        const update = entity.tripUpdate || entity.trip_update;
        if (!update) return [];

        const stopTimeUpdates = update.stopTimeUpdate || update.stop_time_update || [];

        return stopTimeUpdates.map((stu: any) => {
          const feedStopId = stu.stopId || stu.stop_id;
          if (!feedStopId) return null;
          
          const arrival = stu.arrival || stu.departure;
          if (!arrival || !arrival.time) return null;

          const arrivalTime = parseInt(arrival.time, 10);
          const now = Math.floor(Date.now() / 1000);
          const minutesUntil = Math.round((arrivalTime - now) / 60);

          if (arrivalTime <= now || minutesUntil > 60) return null;

          const trip = update.trip || {};
          const routeId = trip.routeId || trip.route_id || "N/A";

          const lastStopUpdate = stopTimeUpdates[stopTimeUpdates.length - 1];
          const destId = (lastStopUpdate?.stopId || lastStopUpdate?.stop_id || "").split("-")[0];
          const destination = STATION_NAMES[destId] || "Sydney";

          return {
            tripId: trip.tripId || trip.trip_id || "N/A",
            routeId: routeId,
            routeName: cleanRouteName({ disassembledName: routeId }),
            destination: destination,
            destinationId: destId,
            stopId: feedStopId,
            stopName: cleanStopName(feedStopId),
            arrivalTime: arrivalTime,
            minutesUntil: minutesUntil,
            delay: arrival.delay || 0,
            platform: cleanPlatform(feedStopId),
            mode: mode
          };
        });
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.arrivalTime - b.arrivalTime)
      .slice(0, 50);

    res.json(trainUpdates);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch network data" });
  }
}
