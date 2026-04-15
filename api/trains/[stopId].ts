import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, getFeedMessage, cleanStopName, cleanPlatform, STATION_NAMES, setCorsHeaders } from '../lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { stopId } = req.query;
  const url = "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains";
  
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

    const trainUpdates = entities
      .flatMap((entity: any) => {
        const update = entity.tripUpdate || entity.trip_update;
        if (!update) return [];

        const stopTimeUpdates = update.stopTimeUpdate || update.stop_time_update || [];
        
        const stopUpdate = stopTimeUpdates.find((stu: any) => {
          const feedStopId = stu.stopId || stu.stop_id;
          if (!feedStopId) return false;
          return feedStopId.startsWith(stopId as string);
        });
        
        if (!stopUpdate) return [];

        const arrival = stopUpdate.arrival || stopUpdate.departure;
        if (!arrival || !arrival.time) return [];

        const arrivalTime = parseInt(arrival.time, 10);
        const now = Math.floor(Date.now() / 1000);
        const minutesUntil = Math.round((arrivalTime - now) / 60);

        if (arrivalTime <= now) return [];

        const trip = update.trip || {};
        const stopIdStr = stopUpdate.stopId || stopUpdate.stop_id || "N/A";

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
          minutesUntil: minutesUntil,
          delay: arrival.delay || 0,
          platform: cleanPlatform(stopIdStr),
        }];
      })
      .filter(Boolean)
      .sort((a: any, b: any) => a.arrivalTime - b.arrivalTime);

    res.json(trainUpdates);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch train data", details: error.message });
  }
}
