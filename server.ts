import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import axios from "axios";
import protobuf from "protobufjs";
import dotenv from "dotenv";

dotenv.config();

const TFNSW_API_KEY = process.env.TFNSW_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJfNGVOOGJ5VmRncWtYUl91UUJRUjA3WFFCU2tUdnY2Rm94al93RTlRYldRIiwiaWF0IjoxNzc1ODkyMzExfQ.OArQg2GIfqeAfHa_Pzwl1hOZGm-_rMemPgYjewJaZbk";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Load Protobuf
  const root = await protobuf.load("gtfs-realtime.proto");
  const FeedMessage = root.lookupType("transit_realtime.FeedMessage");

  // --- Data Cleaning Helpers ---
  const ROUTE_MAPPINGS: Record<string, string> = {
    'NSN': 'T1', 'IWL': 'T2', 'BNK': 'T3', 'ESL': 'T4', 'WST': 'T5',
    'OLY': 'T7', 'APL': 'T8', 'NNS': 'T9', 'BMT': 'BMT', 'CCN': 'CCN',
    'SCO': 'SCO', 'SHL': 'SHL', 'HUN': 'HUN', 'NRT': 'Metro',
    'L1': 'L1', 'L2': 'L2', 'L3': 'L3', 'F1': 'F1', 'F2': 'F2'
  };

  const STATION_NAMES: Record<string, string> = {
    '200010': 'Central', '200060': 'Town Hall', '200070': 'Wynyard', '200080': 'Circular Quay',
    '200090': 'St James', '200100': 'Museum', '201610': 'Redfern', '213510': 'Strathfield',
    '215010': 'Parramatta', '214810': 'Blacktown', '275010': 'Penrith', '207710': 'Hornsby',
    '206710': 'Chatswood', '206010': 'North Sydney', '202210': 'Bondi Junction', '222010': 'Hurstville',
    '223010': 'Cronulla', '223210': 'Sutherland', '256010': 'Campbelltown', '217010': 'Liverpool',
    '220010': 'Bankstown', '214110': 'Lidcombe', '213410': 'Burwood', '213110': 'Ashfield',
    '204910': 'Petersham', '204210': 'Newtown', '204810': 'Stanmore', '201620': 'Macdonaldtown',
    '204310': 'Erskineville', '204410': 'St Peters', '204420': 'Sydenham', '220510': 'Wolli Creek',
    '202010': 'International Airport', '202020': 'Domestic Airport', '202030': 'Mascot',
    '201710': 'Green Square', '201110': 'Kings Cross', '202710': 'Edgecliff', '214010': 'Homebush',
    '213210': 'Summer Hill', '213010': 'Lewisham', '212110': 'Epping', '212210': 'Eastwood',
    '211410': 'West Ryde', '211310': 'Meadowbank', '211210': 'Rhodes', '213810': 'Concord West',
    '213710': 'North Strathfield', '214410': 'Auburn', '214210': 'Berala', '214310': 'Regents Park',
    '216110': 'Guildford', '216010': 'Merrylands', '216210': 'Yennora', '216310': 'Fairfield',
    '216410': 'Canley Vale', '216510': 'Cabramatta', '216610': 'Warwick Farm', '216810': 'Casula',
    '217310': 'Holsworthy', '221310': 'East Hills', '221210': 'Panania', '221110': 'Revesby',
    '221010': 'Padstow', '220910': 'Riverwood', '220810': 'Narwee', '220710': 'Beverly Hills',
    '220610': 'Kingsgrove', '220410': 'Turrella', '220310': 'Bardwell Park', '220210': 'Bexley North',
    '221710': 'Kogarah', '221810': 'Carlton', '221910': 'Allawah', '222110': 'Penshurst',
    '222210': 'Mortdale', '222310': 'Oatley', '222410': 'Como', '222510': 'Jannali',
    '223310': 'Loftus', '223410': 'Engadine', '223420': 'Heathcote', '250810': 'Waterfall',
    '214510': 'Wentworthville', '214610': 'Pendle Hill', '214710': 'Toongabbie', '214820': 'Seven Hills',
    '214830': 'Marayong', '214840': 'Quakers Hill', '276310': 'Schofields', '276510': 'Riverstone',
    '275610': 'Mulgrave', '275620': 'Windsor', '275630': 'Richmond', '215110': 'North Rocks',
    '215310': 'Baulkham Hills', '215410': 'Castle Hill', '215510': 'Rouse Hill', '215520': 'Kellyville',
    '215530': 'Bella Vista', '215540': 'Norwest', '215320': 'Showground', '215330': 'Cherrybrook',
    '211910': 'Beecroft', '212010': 'Pennant Hills', '212020': 'Thornleigh', '207610': 'Normanhurst',
    '207720': 'Waitara', '207620': 'Wahroonga', '207630': 'Warrawee', '207410': 'Turramurra',
    '207310': 'Pymble', '207210': 'Gordon', '207110': 'Killara', '207010': 'Lindfield',
    '206910': 'Roseville', '206510': 'St Leonards', '206520': 'Wollstonecraft', '206020': 'Waverton',
    '206110': 'Milsons Point', '201010': 'Surry Hills', '201510': 'Alexandria', '201810': 'Rosebery',
    '219410': 'Campsie', '219310': 'Ashbury', '219210': 'Belmore', '219510': 'Lakemba',
    '219610': 'Wiley Park', '219910': 'Punchbowl', '220020': 'Yagoona', '214320': 'Birrong',
    '214330': 'Sefton', '216120': 'Chester Hill', '216220': 'Villawood', '216320': 'Carramar',
    '217910': 'Leppington', '217110': 'Edmondson Park', '217410': 'Glenfield', '217120': 'Macquarie Fields',
    '217130': 'Ingleburn', '217140': 'Minto', '217150': 'Leumeah', '256020': 'Macarthur',
    '214220': 'Granville', '215020': 'Harris Park', '214520': 'Westmead', '277010': 'Mount Druitt',
    '276010': 'St Marys', '274710': 'Werrington', '274720': 'Kingswood', '275020': 'Emu Plains',
    '214020': 'Flemington', '212710': 'Olympic Park', '250010': 'Wollongong', '230010': 'Newcastle Interchange'
  };

  function cleanRouteName(trans: any) {
    if (!trans) return "N/A";
    const disassembled = trans.disassembledName || "";
    const name = trans.name || "";
    const number = trans.number || "";
    const line = trans.properties?.line || "";
    
    if (line && /^[TBMFL]\d+$/.test(line)) return line;
    if (disassembled && /^[TBMFL]\d+$/.test(disassembled)) return disassembled;
    
    const allFields = [disassembled, name, number, line];
    for (const field of allFields) {
      if (field && typeof field === 'string') {
        if (field.includes('_')) {
          const prefix = field.split('_')[0];
          if (ROUTE_MAPPINGS[prefix]) return ROUTE_MAPPINGS[prefix];
        }
        if (/^[TBMFL]\d+$/.test(field)) return field;
      }
    }
    
    if (number && /^[TBMFL]\d+$/.test(number)) return number;
    return (disassembled || name || number || "N/A").replace(/Line$/, '').replace(/Service$/, '').trim();
  }

  function cleanStopName(loc: any) {
    if (!loc) return "Unknown Stop";
    let id = "";
    let name = "";
    
    if (typeof loc === 'string') {
      id = loc.split("-")[0];
      name = STATION_NAMES[id] || loc;
    } else {
      id = (loc.id || "").split("-")[0];
      name = loc.disassembledName || loc.name || STATION_NAMES[id] || "";
      const parentName = loc.parent?.name || "";
      if ((!name || /^\d+$/.test(name)) && parentName) name = parentName;
    }
    
    if (!name || /^\d+$/.test(name)) {
      return STATION_NAMES[id] || ("Station " + (id || "N/A"));
    }
    
    return name.replace(/\s\[\d+\]$/, '').replace(/,\sSydney$/, '').replace(/,\sNSW$/, '').trim();
  }

  function cleanPlatform(loc: any) {
    if (!loc) return "N/A";
    
    // If loc is a string (GTFS-R stopId), try to extract platform suffix
    if (typeof loc === 'string') {
      const parts = loc.split("-");
      if (parts.length > 1) {
        const last = parts[parts.length - 1];
        if (last.length <= 3) return last;
      }
      return "N/A";
    }

    let p = loc.platform || loc.properties?.stopPostName || "";
    if (p.length > 5 && /^\d+$/.test(p)) p = loc.properties?.stopPostName || "";
    if (!p || p === "N/A") return "N/A";
    const match = p.match(/(?:Platform|Stand|Wharf|Stop|Bay)\s*([A-Z0-9]+)/i);
    return match ? match[1] : p;
  }

  // API Route for ALL Network Departures (Live Network)
  app.get("/api/network/live", async (req, res) => {
    const mode = (req.query.mode as string) || 'train';
    
    const URL_MAP: Record<string, string> = {
      'train': "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains",
      'bus': "https://api.transport.nsw.gov.au/v1/gtfs/realtime/buses",
      'ferry': "https://api.transport.nsw.gov.au/v1/gtfs/realtime/ferries",
      'light_rail': "https://api.transport.nsw.gov.au/v1/gtfs/realtime/lightrail/",
      'metro': "https://api.transport.nsw.gov.au/v2/gtfs/realtime/metro"
    };

    const url = URL_MAP[mode] || URL_MAP['train'];
    console.log(`[DEBUG] API Request for ALL network ${mode} departures`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `apikey ${TFNSW_API_KEY}`,
          Accept: "application/x-google-protobuf",
        },
        responseType: "arraybuffer",
      });

      let message;
      try {
        message = FeedMessage.decode(new Uint8Array(response.data));
      } catch (decodeError: any) {
        console.error("[ERROR] Protobuf Decode Failed:", decodeError.message);
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

            // For global view, show departures in the next 60 mins
            if (arrivalTime <= now || minutesUntil > 60) return null;

            const trip = update.trip || {};
            const routeId = trip.routeId || trip.route_id || "N/A";

            // Find destination from the last stop update in the trip
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

      console.log(`[DEBUG] Found ${trainUpdates.length} network updates for ${mode}`);
      res.json(trainUpdates);
    } catch (error: any) {
      console.error(`[ERROR] Fetching network ${mode} data:`, error.message);
      res.status(500).json({ error: "Failed to fetch network data" });
    }
  });

  // Generic Live API Route
  app.get("/api/live", async (req, res) => {
    const { mode = 'train', origin, destination } = req.query;
    
    let url = "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains";
    if (mode === 'bus') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/buses";
    if (mode === 'ferry') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/ferries";
    if (mode === 'lightrail') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/lightrail";
    if (mode === 'metro') url = "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains"; // Metro often in same feed or similar

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `apikey ${TFNSW_API_KEY}`,
          Accept: "application/x-google-protobuf",
        },
        responseType: "arraybuffer",
      });

      const message = FeedMessage.decode(new Uint8Array(response.data));
      const feed = FeedMessage.toObject(message, {
        enums: String,
        longs: String,
      }) as any;

      const entities = feed.entity || [];
      const results = entities
        .flatMap((entity: any) => {
          const update = entity.tripUpdate || entity.trip_update;
          if (!update) return [];

          const stopTimeUpdates = update.stopTimeUpdate || update.stop_time_update || [];
          
          if (origin && destination) {
            // Find trips containing BOTH origin and destination
            const originUpdate = stopTimeUpdates.find((stu: any) => (stu.stopId || stu.stop_id).startsWith(origin));
            const destUpdate = stopTimeUpdates.find((stu: any) => (stu.stopId || stu.stop_id).startsWith(destination));
            
            if (originUpdate && destUpdate) {
              const originTime = parseInt((originUpdate.arrival || originUpdate.departure)?.time || "0", 10);
              const destTime = parseInt((destUpdate.arrival || destUpdate.departure)?.time || "0", 10);
              
              const now = Math.floor(Date.now() / 1000);
              
              // Ensure destination is after origin and origin is in the future
              if (destTime > originTime && originTime > now) {
                const minutesUntil = Math.round((originTime - now) / 60);
                const trip = update.trip || {};
                
                return [{
                  tripId: trip.tripId || trip.trip_id || "N/A",
                  routeId: trip.routeId || trip.route_id || "N/A",
                  destination: "Service to Destination",
                  stopId: originUpdate.stopId || originUpdate.stop_id,
                  arrivalTime: originTime,
                  minutesUntil: minutesUntil,
                  delay: (originUpdate.arrival || originUpdate.departure)?.delay || 0,
                  platform: (originUpdate.stopId || originUpdate.stop_id).split("-").pop() || "N/A",
                  mode: mode as any
                }];
              }
            }
            return [];
          } else if (origin) {
            // Only origin provided (standard departure board)
            const stopUpdate = stopTimeUpdates.find((stu: any) => (stu.stopId || stu.stop_id).startsWith(origin));
            if (!stopUpdate) return [];

            const arrival = stopUpdate.arrival || stopUpdate.departure;
            if (!arrival || !arrival.time) return [];

            const arrivalTime = parseInt(arrival.time, 10);
            const now = Math.floor(Date.now() / 1000);
            if (arrivalTime <= now) return [];

            const minutesUntil = Math.round((arrivalTime - now) / 60);
            const trip = update.trip || {};

            return [{
              tripId: trip.tripId || trip.trip_id || "N/A",
              routeId: trip.routeId || trip.route_id || "N/A",
              routeName: trip.routeId || trip.route_id || "N/A",
              destination: "Service",
              stopId: stopUpdate.stopId || stopUpdate.stop_id,
              arrivalTime: arrivalTime,
              minutesUntil: minutesUntil,
              delay: arrival.delay || 0,
              platform: (stopUpdate.stopId || stopUpdate.stop_id).split("-").pop() || "N/A",
              mode: mode as any
            }];
          }
          return [];
        })
        .filter(Boolean)
        .sort((a: any, b: any) => a.arrivalTime - b.arrivalTime);

      res.json(results);
    } catch (error: any) {
      console.error("[ERROR] Live API failed:", error.message);
      res.status(500).json({ error: "Failed to fetch live data" });
    }
  });

// --- API Routes ---

  // API Route for Departure Board (Human Readable)
  app.get("/api/departures", async (req, res) => {
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
          
          // Filter by mode
          let matches = false;
          if (mode === 'train') matches = (mot === 1 || mot === 8);
          else if (mode === 'bus') matches = (mot === 4 || mot === 5 || mot === 7 || mot === 9);
          else if (mode === 'ferry') matches = (mot === 6 || mot === 10);
          else if (mode === 'light_rail') matches = (mot === 3);
          else if (mode === 'metro') matches = (mot === 2);
          else matches = true; // Fallback

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
      console.error("[ERROR] Departure Mon failed:", error.message);
      res.status(500).json({ error: "Failed to fetch departures" });
    }
  });

  // API Route for Stop Finder
  app.get("/api/stop-finder", async (req, res) => {
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
      console.error("[ERROR] Stop Finder failed:", error.message);
      res.status(500).json({ error: "Failed to search stops" });
    }
  });

  // API Route for Trip Planning
  app.get("/api/trip", async (req, res) => {
    const { origin, destination, mode = 'train', trainsOnly } = req.query;
    const now = new Date();
    const itdDate = now.toISOString().slice(0, 10).replace(/-/g, '');
    const itdTime = now.toTimeString().slice(0, 5).replace(/:/g, '');
    
    let url = `https://api.transport.nsw.gov.au/v1/tp/trip?outputFormat=rapidJSON&coordOutputFormat=EPSG:4326&depArrMacro=dep&itdDate=${itdDate}&itdTime=${itdTime}&type_origin=any&name_origin=${origin}&type_destination=any&name_destination=${destination}&calcNumberOfTrips=5&tfNSWTR=true&TfNSW=true`;
    
    // Filter by mode using excludedMeans
    // Means: 1: Train, 2: Metro, 3: Light Rail, 4: Bus, 5: Coach, 6: Ferry, 7: School Bus, 8: Train (Regional), 9: Bus (Regional), 10: Ferry (Regional)
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
      console.error("[ERROR] Trip Planning failed:", error.message);
      res.status(500).json({ error: "Failed to plan trip" });
    }
  });

  // API Route for Vehicle Positions V2
  app.get("/api/vehicles", async (req, res) => {
    const url = "https://api.transport.nsw.gov.au/v2/gtfs/vehiclepos/sydneytrains";
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `apikey ${TFNSW_API_KEY}`,
          Accept: "application/x-google-protobuf",
        },
        responseType: "arraybuffer",
      });

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
      // Silent fail as requested
      console.error("[SILENT ERROR] Fetching vehicle positions:", error.message);
      res.json([]);
    }
  });

  // Universal API Route for Real-time Transit (Multi-Mode & Routing)
  app.get("/api/live", async (req, res) => {
    const { mode = 'train', origin, destination } = req.query;
    
    let url = "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains";
    if (mode === 'bus') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/buses";
    if (mode === 'ferry') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/ferries";
    if (mode === 'lightrail') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/lightrail/sydneylightrail";
    if (mode === 'metro') url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/metro";

    console.log(`[DEBUG] API Request for Mode: ${mode}, Origin: ${origin}, Dest: ${destination}`);

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `apikey ${TFNSW_API_KEY}`,
          Accept: "application/x-google-protobuf",
        },
        responseType: "arraybuffer",
      });

      let message;
      try {
        message = FeedMessage.decode(new Uint8Array(response.data));
      } catch (decodeError: any) {
        console.error("[ERROR] Protobuf Decode Failed:", decodeError.message);
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
            // A-to-B Route Matching Logic
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

            // 1. Both stop_id values in array (checked above)
            // 2. Destination arrival time is mathematically greater than Origin arrival time
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
            // Single Station Logic
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

            // Find destination from the last stop update in the trip
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
      console.error("[ERROR] Fetching live GTFS data:", error.message);
      res.status(500).json({ error: "Failed to fetch live data" });
    }
  });

  // API Route for Real-time Trains (Legacy)
  app.get("/api/trains/:stopId", async (req, res) => {
    const { stopId } = req.params;
    const url = "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains";
    
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `apikey ${TFNSW_API_KEY}`,
          Accept: "application/x-google-protobuf",
        },
        responseType: "arraybuffer",
      });

      let message;
      try {
        message = FeedMessage.decode(new Uint8Array(response.data));
      } catch (decodeError: any) {
        console.error("[ERROR] Protobuf Decode Failed:", decodeError.message);
        return res.status(500).json({ error: "Protobuf Decode Failed" });
      }

      const feed = FeedMessage.toObject(message, {
        enums: String,
        longs: String,
      }) as any;

      const entities = feed.entity || [];

      // Filter and extract relevant data for the specific stop
      const trainUpdates = entities
        .flatMap((entity: any) => {
          const update = entity.tripUpdate || entity.trip_update;
          if (!update) return [];

          const stopTimeUpdates = update.stopTimeUpdate || update.stop_time_update || [];
          
          // Use 'starts with' match for Platform IDs vs Station IDs
          const stopUpdate = stopTimeUpdates.find((stu: any) => {
            const feedStopId = stu.stopId || stu.stop_id;
            if (!feedStopId) return false;
            return feedStopId.startsWith(stopId);
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

          // Find destination from the last stop update in the trip
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
      console.error("[ERROR] Fetching GTFS data:", error.message);
      if (error.response) {
        console.error("[ERROR] Response Status:", error.response.status);
        try {
          // Since responseType is arraybuffer, we must convert it to a string to read the JSON error
          const errorJson = Buffer.from(error.response.data).toString('utf8');
          console.error("[ERROR] Full ErrorDetails JSON:", errorJson);
        } catch (parseError) {
          console.error("[ERROR] Could not parse error response data");
        }
      }
      res.status(500).json({ error: "Failed to fetch train data", details: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
