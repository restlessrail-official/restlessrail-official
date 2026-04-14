import axios from 'axios';

async function test() {
  const urls = [
    "https://api.transport.nsw.gov.au/v1/gtfs/realtime/sydneytrains",
    "https://api.transport.nsw.gov.au/v1/gtfs/realtime/sydney-trains",
    "https://api.transport.nsw.gov.au/v2/gtfs/realtime/sydneytrains",
    "https://api.transport.nsw.gov.au/v1/gtfs/realtime/nswtrains"
  ];
  
  for (const url of urls) {
    try {
      const res = await axios.get(url, {
        headers: {
          Authorization: "apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJfNGVOOGJ5VmRncWtYUl91UUJRUjA3WFFCU2tUdnY2Rm94al93RTlRYldRIiwiaWF0IjoxNzc1ODkyMzExfQ.OArQg2GIfqeAfHa_Pzwl1hOZGm-_rMemPgYjewJaZbk",
          Accept: "application/x-google-protobuf"
        }
      });
      console.log(`SUCCESS: ${url} - ${res.status}`);
    } catch (e: any) {
      console.log(`FAIL: ${url} - ${e.response?.status}`);
    }
  }
}
test();
