import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, cleanStopName, setCorsHeaders } from './lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { name_sf } = req.query;
  const url = `https://api.transport.nsw.gov.au/v1/tp/stop_finder?outputFormat=rapidJSON&type_sf=any&name_sf=${encodeURIComponent(name_sf as string)}&coordOutputFormat=EPSG:4326&TfNSW=true`;
  
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `apikey ${TFNSW_API_KEY}`,
      },
    });
    const locations = response.data.locations || [];
    const cleanedLocations = locations.map((loc: any) => ({
      ...loc,
      name: cleanStopName(loc)
    }));
    
    res.json({ ...response.data, locations: cleanedLocations });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to search stops" });
  }
}
