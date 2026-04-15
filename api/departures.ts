import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, cleanRouteName, cleanStopName, cleanPlatform, setCorsHeaders } from './lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { origin, mode = 'train' } = req.query;
  const now = new Date();
  const itdDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const itdTime = now.toTimeString().slice(0, 5).replace(/:/g, '');
  
  const url = `https://api.transport.nsw.gov.au/v1/tp/departure_mon?outputFormat=rapidJSON&coordOutputFormat=EPSG:4326&mode=dep&itdDate=${itdDate}&itdTime=${itdTime}&type_dm=any&name_dm=${origin}&TfNSW=true`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `apikey ${TFNSW_API_KEY}`,
      },
    });
    
    const departures = response.data.stopEvents || [];
    const results = departures
      .map((event: any) => {
        const departureTime = Math.floor(new Date(event.departureTimePlanned || event.departureTimeEstimated).getTime() / 1000);
        const nowSec = Math.floor(Date.now() / 1000);
        const mot = event.transportation.product.class;
        
        let matches = false;
        if (mode === 'train') matches = (mot === 1 || mot === 8);
        else if (mode === 'bus') matches = (mot === 4 || mot === 5 || mot === 7 || mot === 9);
        else if (mode === 'ferry') matches = (mot === 6 || mot === 10);
        else if (mode === 'light_rail') matches = (mot === 3);
        else if (mode === 'metro') matches = (mot === 2);
        else matches = true; 

        if (!matches) return null;

        return {
          tripId: event.transportation.properties.tripCode || event.transportation.number,
          routeId: event.transportation.number,
          routeName: cleanRouteName(event.transportation),
          destination: cleanStopName(event.transportation.destination),
          stopId: event.location.id,
          stopName: cleanStopName(event.location),
          arrivalTime: departureTime,
          minutesUntil: Math.round((departureTime - nowSec) / 60),
          delay: event.departureDelay || 0,
          platform: cleanPlatform(event.location),
          mot: mot,
          mode: mode,
          legs: []
        };
      })
      .filter(Boolean);
    
    res.json(results);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch departures" });
  }
}
