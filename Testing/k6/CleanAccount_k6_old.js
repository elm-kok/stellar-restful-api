import http from 'k6/http';
import {sleep, check} from 'k6';
const data = JSON.parse(open('./accountListDoctor.json'));
export let options = {
  stages: [{duration: '10s', target: 100}],
};

export default function() {
  let user = data.users[__VU - 1].publicKey;
  var payload = JSON.stringify({
    spk: user,
  });

  var params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };
  /*
  var url = 'http://192.168.2.36:3001/api/test';
  let res = http.post(url, payload, params);
  check(res, {
    'is status 200': r => r.status === 200,
  });
  */
  console.log(__VU - 1);
  //sleep(1);
}
