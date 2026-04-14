import axios from 'axios';

async function test() {
  try {
    const url = "https://api.transport.nsw.gov.au/v1/gtfs/realtime/sydney-trains";
    const res = await axios.get(url, {
      headers: {
        Authorization: "apikey eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJfNGVOOGJ5VmRncWtYUl91UUJRUjA3WFFCU2tUdnY2Rm94al93RTlRYldRIiwiaWF0IjoxNzc1ODkyMzExfQ.OArQg2GIfqeAfHa_Pzwl1hOZGm-_rMemPgYjewJaZbk"
      }
    });
    console.log(res.status);
  } catch (e: any) {
    console.log(e.response?.status);
    console.log(e.response?.data);
  }
}
test();
