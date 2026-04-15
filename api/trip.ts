import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import { TFNSW_API_KEY, setCorsHeaders } from './lib/transit-utils';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  setCorsHeaders(res);
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { origin, destination, mode = 'train', trainsOnly } = req.query;
  const now = new Date();
  const itdDate = now.toISOString().slice(0, 10).replace(/-/g, '');
  const itdTime = now.toTimeString().slice(0, 5).replace(/:/g, '');
  
  let url = `https://api.transport.nsw.gov.au/v1/tp/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG:4326&depArrMacro=dep&itdDate=${itdDate}&itdTime=${itdTime}&type_origin=any&name_origin=${origin}&type_destination=any&name_destination=${destination}&calcNumberOfTrips=5&tfNSWTR=true&TfNSW=true`;
  
  if (trainsOnly === 'true' || mode === 'train') {
    url += `&excludedMeans=2,3,4,5,6,7,9,10,11&itOptionsActive=1`;
  } else if (mode === 'bus') {
    url += `&excludedMeans=1,2,3,6,8,10&itOptionsActive=1`;
  } else if (mode === 'ferry') {
    url += `&excludedMeans=1,2,3,4,5,7,8,9&itOptionsActive=1`;
  } else if (mode === 'light_rail') {
    url += `&excludedMeans=1,2,4,5,6,7,8,9,10&itOptionsActive=1`;
  } else if (mode === 'metro') {
    url += `&excludedMeans=1,3,4,5,6,7,8,9,10&itOptionsActive=1`;
  }

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `apikey ${TFNSW_API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to plan trip" });
  }
}
