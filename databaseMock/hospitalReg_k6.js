import http from "k6/http";
import { sleep, check } from "k6";

const data = JSON.parse(open("./PatientSPK.json"));
export let options = {
  stages: [{ duration: "1s", target: 3 }],
};

export default function () {
  var payload = JSON.stringify({
    HOSPCODE: "09082",
    CID: data.users[__VU - 1].cid,
    SPK: data.users[__VU - 1].publicKey,
    Seq: data.users[__VU - 1].hospSigSeq,
  });

  var params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  var url = "http://192.168.2.36:3001/api/findPid/";
  let res = http.post(url, payload, params);
  check(res, {
    "is status 200": (r) => r.status === 200,
  });

  console.log(__VU - 1, res.status);
  //sleep(1);
}
