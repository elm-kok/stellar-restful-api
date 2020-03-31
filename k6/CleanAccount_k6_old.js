import http from 'k6/http';
import {check, sleep} from 'k6';
export let options = {
  stages: [{duration: '10s', target: 100}],
};

export default async function() {
  let res = http.get('https://httpbin.org/');
  check(res, {
    'status was 200': r => r.status == 200,
    'transaction time OK': r => r.timings.duration < 200,
  });
  sleep(1);
}
