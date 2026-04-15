import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, getFeedMessage, setCorsHeaders } from './lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const url = "https://api.transport.nsw.gov.au/v2/gtfs/vehiclepos/sydneytrains";
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `apikey ${TFNSW_API_KEY}`,
        Accept: "application/x-google-protobuf",
      },
      responseType: "arraybuffer",
    });

    const FeedMessage = await getFeedMessage();
    const message = FeedMessage.decode(new Uint8Array(response.data));
    const feed = FeedMessage.toObject(message, {
      enums: String,
      longs: String,
    }) as any;

    const entities = feed.entity || [];
    const vehicles = entities
      .filter((entity: any) => entity.vehicle)
      .map((entity: any) => {
        const v = entity.vehicle;
        return {
          id: v.vehicle?.id || entity.id,
          tripId: v.trip?.tripId || v.trip?.trip_id,
          routeId: v.trip?.routeId || v.trip?.route_id,
          latitude: v.position?.latitude,
          longitude: v.position?.longitude,
          timestamp: v.timestamp,
        };
      })
      .filter((v: any) => v.latitude && v.longitude);

    res.json(vehicles);
  } catch (error: any) {
    res.json([]);
  }
}
