import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, getFeedMessage, cleanStopName, cleanPlatform, STATION_NAMES, setCorsHeaders } from './lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { mode = 'train', origin, destination } = req.query;
  
  let url = "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains";
  if (mode === 'bus') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/buses";
  if (mode === 'ferry') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/ferries";
  if (mode === 'lightrail') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/lightrail/sydneylightrail";
  if (mode === 'metro') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/metro";

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
      return res.status(500).json({ error: "Protobuf Decode Failed" });
    }

    const feed = FeedMessage.toObject(message, {
      enums: String,
      longs: String,
    }) as any;

    const entities = feed.entity || [];

    const transitUpdates = entities
      .flatMap((entity: any) => {
        const update = entity.tripUpdate || entity.trip_update;
        if (!update) return [];

        const stopTimeUpdates = update.stopTimeUpdate || update.stop_time_update || [];
        
        if (origin && destination) {
          const originUpdate = stopTimeUpdates.find((stu: any) => {
            const id = stu.stopId || stu.stop_id;
            return id && id.startsWith(origin as string);
          });
          const destUpdate = stopTimeUpdates.find((stu: any) => {
            const id = stu.stopId || stu.stop_id;
            return id && id.startsWith(destination as string);
          });

          if (!originUpdate || !destUpdate) return [];

          const originArrival = originUpdate.arrival || originUpdate.departure;
          const destArrival = destUpdate.arrival || destUpdate.departure;
          
          if (!originArrival || !originArrival.time || !destArrival || !destArrival.time) return [];

          const originTime = parseInt(originArrival.time, 10);
          const destTime = parseInt(destArrival.time, 10);
          const now = Math.floor(Date.now() / 1000);

          if (destTime <= originTime || originTime <= now) return [];

          const trip = update.trip || {};
          const stopIdStr = originUpdate.stopId || originUpdate.stop_id || "N/A";

          return [{
            tripId: trip.tripId || trip.trip_id || "N/A",
            routeId: trip.routeId || trip.route_id || "N/A",
            destination: "Trip to Destination",
            stopId: stopIdStr,
            arrivalTime: originTime,
            destArrivalTime: destTime,
            duration: Math.round((destTime - originTime) / 60),
            minutesUntil: Math.round((originTime - now) / 60),
            delay: originArrival.delay || 0,
            platform: stopIdStr.split("-").pop() || stopIdStr.slice(-1) || "N/A",
            mode: mode
          }];
        } else if (origin) {
          const originUpdate = stopTimeUpdates.find((stu: any) => {
            const id = stu.stopId || stu.stop_id;
            return id && id.startsWith(origin as string);
          });

          if (!originUpdate) return [];

          const arrival = originUpdate.arrival || originUpdate.departure;
          if (!arrival || !arrival.time) return [];

          const arrivalTime = parseInt(arrival.time, 10);
          const now = Math.floor(Date.now() / 1000);
          if (arrivalTime <= now) return [];

          const trip = update.trip || {};
          const stopIdStr = originUpdate.stopId || originUpdate.stop_id || "N/A";

          const lastStopUpdate = stopTimeUpdates[stopTimeUpdates.length - 1];
          const destId = (lastStopUpdate?.stopId || lastStopUpdate?.stop_id || "").split("-")[0];
          const destination = STATION_NAMES[destId] || "Sydney";

          return [{
            tripId: trip.tripId || trip.trip_id || "N/A",
            routeId: trip.routeId || trip.route_id || "N/A",
            destination: destination,
            stopId: stopIdStr,
            stopName: cleanStopName(stopIdStr),
            arrivalTime: arrivalTime,
            minutesUntil: Math.round((arrivalTime - now) / 60),
            delay: arrival.delay || 0,
            platform: cleanPlatform(stopIdStr),
            mode: mode
          }];
        }

        return [];
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.arrivalTime - b.arrivalTime)
      .slice(0, 50);

    res.json(transitUpdates);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch live data" });
  }
}
