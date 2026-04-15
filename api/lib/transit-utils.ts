import protobuf from "protobufjs";

export const TFNSW_API_KEY = process.env.TFNSW_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJfNGVOOGJ5VmRncWtYUl91UUJRUjA3WFFCU2tUdnY2Rm94al93RTlRYldRIiwiaWF0IjoxNzc1ODkyMzExfQ.OArQg2GIfqeAfHa_Pzwl1hOZGm-_rMemPgYjewJaZbk";

export const ROUTE_MAPPINGS: Record<string, string> = {
  'NSN': 'T1', 'IWL': 'T2', 'BNK': 'T3', 'ESL': 'T4', 'WST': 'T5',
  'OLY': 'T7', 'APL': 'T8', 'NNS': 'T9', 'BMT': 'BMT', 'CCN': 'CCN',
  'SCO': 'SCO', 'SHL': 'SHL', 'HUN': 'HUN', 'NRT': 'Metro',
  'L1': 'L1', 'L2': 'L2', 'L3': 'L3', 'F1': 'F1', 'F2': 'F2'
};

export const STATION_NAMES: Record<string, string> = {
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

export function cleanRouteName(trans: any) {
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

export function cleanStopName(loc: any) {
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

export function cleanPlatform(loc: any) {
  if (!loc) return "N/A";
  
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

const protoContent = `
syntax = "proto2";
package transit_realtime;

message FeedMessage {
  required FeedHeader header = 1;
  repeated FeedEntity entity = 2;
}

message FeedHeader {
  required string gtfs_realtime_version = 1;
  enum Incrementality {
    FULL_DATASET = 0;
    DIFFERENTIAL = 1;
  }
  optional Incrementality incrementality = 2 [default = FULL_DATASET];
  optional uint64 timestamp = 3;
}

message FeedEntity {
  required string id = 1;
  optional bool is_deleted = 2 [default = false];
  optional TripUpdate trip_update = 3;
  optional VehiclePosition vehicle = 4;
  optional Alert alert = 5;
}

message TripUpdate {
  required TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 3;
  message StopTimeEvent {
    optional int32 delay = 1;
    optional int64 time = 2;
    optional int32 uncertainty = 3;
  }
  message StopTimeUpdate {
    optional uint32 stop_sequence = 1;
    optional string stop_id = 4;
    optional StopTimeEvent arrival = 2;
    optional StopTimeEvent departure = 3;
    enum ScheduleRelationship {
      SCHEDULED = 0;
      SKIPPED = 1;
      NO_DATA = 2;
    }
    optional ScheduleRelationship schedule_relationship = 5 [default = SCHEDULED];
  }
  repeated StopTimeUpdate stop_time_update = 2;
  optional uint64 timestamp = 4;
  optional int32 delay = 5;
}

message VehiclePosition {
  optional TripDescriptor trip = 1;
  optional VehicleDescriptor vehicle = 8;
  optional Position position = 2;
  optional uint32 current_stop_sequence = 3;
  optional string stop_id = 7;
  enum VehicleStopStatus {
    INCOMING_AT = 0;
    STOPPED_AT = 1;
    IN_TRANSIT_TO = 2;
  }
  optional VehicleStopStatus current_status = 4 [default = IN_TRANSIT_TO];
  optional uint64 timestamp = 5;
  enum CongestionLevel {
    UNKNOWN_CONGESTION_LEVEL = 0;
    RUNNING_SMOOTHLY = 1;
    STOP_AND_GO = 2;
    CONGESTION = 3;
    SEVERE_CONGESTION = 4;
  }
  optional CongestionLevel congestion_level = 6;
  enum OccupancyStatus {
    EMPTY = 0;
    MANY_SEATS_AVAILABLE = 1;
    FEW_SEATS_AVAILABLE = 2;
    STANDING_ROOM_ONLY = 3;
    CRUSHED_STANDING_ROOM_ONLY = 4;
    FULL = 5;
    NOT_ACCEPTING_PASSENGERS = 6;
  }
  optional OccupancyStatus occupancy_status = 9;
}

message Alert {
  repeated TimeRange active_period = 1;
  repeated EntitySelector informed_entity = 5;
  enum Cause {
    UNKNOWN_CAUSE = 1;
    OTHER_CAUSE = 2;
    TECHNICAL_PROBLEM = 3;
    STRIKE = 4;
    DEMONSTRATION = 5;
    ACCIDENT = 6;
    HOLIDAY = 7;
    WEATHER = 8;
    MAINTENANCE = 9;
    CONSTRUCTION = 10;
    POLICE_ACTIVITY = 11;
    MEDICAL_EMERGENCY = 12;
  }
  optional Cause cause = 6 [default = UNKNOWN_CAUSE];
  enum Effect {
    NO_SERVICE = 1;
    REDUCED_SERVICE = 2;
    SIGNIFICANT_DELAYS = 3;
    DETOUR = 4;
    ADDITIONAL_SERVICE = 5;
    MODIFIED_SERVICE = 6;
    OTHER_EFFECT = 7;
    UNKNOWN_EFFECT = 8;
    STOP_MOVED = 9;
  }
  optional Effect effect = 7 [default = UNKNOWN_EFFECT];
  optional TranslatedString url = 8;
  optional TranslatedString header_text = 10;
  optional TranslatedString description_text = 11;
}

message TimeRange {
  optional uint64 start = 1;
  optional uint64 end = 2;
}

message Position {
  required float latitude = 1;
  required float longitude = 2;
  optional float bearing = 3;
  optional double odometer = 4;
  optional float speed = 5;
}

message TripDescriptor {
  optional string trip_id = 1;
  optional string route_id = 5;
  optional uint32 direction_id = 6;
  optional string start_time = 2;
  optional string start_date = 3;
  enum ScheduleRelationship {
    SCHEDULED = 0;
    ADDED = 1;
    UNSCHEDULED = 2;
    CANCELED = 3;
    REPLACEMENT = 5;
  }
  optional ScheduleRelationship schedule_relationship = 4;
}

message VehicleDescriptor {
  optional string id = 1;
  optional string label = 2;
  optional string license_plate = 3;
}

message EntitySelector {
  optional string agency_id = 1;
  optional string route_id = 2;
  optional int32 route_type = 3;
  optional TripDescriptor trip = 4;
  optional string stop_id = 5;
}

message TranslatedString {
  message Translation {
    required string text = 1;
    optional string language = 2;
  }
  repeated Translation translation = 1;
}
`;

export async function getFeedMessage() {
  const root = protobuf.parse(protoContent).root;
  return root.lookupType("transit_realtime.FeedMessage");
}

export function setCorsHeaders(res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
}
