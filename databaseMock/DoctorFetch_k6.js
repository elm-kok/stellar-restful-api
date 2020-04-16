import http from "k6/http";
import { sleep, check } from "k6";

const data = JSON.parse(open("./PatientSPK.json"));
export let options = {
  stages: [{ duration: "3s", target: 3 }],
};

export default function () {
  var payload = JSON.stringify({
    PatientSPK: data.users[__VU - 1].publicKey,
    DoctorSPK: "GDGIKEGHH6W5YZ65F37OOA5CAKYCNOTD4DZUKRFVUMSFPXRSEU3VWZZJ",
    SEQ: data.users[__VU - 1].doctorSigSeq,
    DoctorSignature: data.users[__VU - 1].DoctorSignature,
    HospitalSignature: data.users[__VU - 1].HospitalSignature,
    HospCode: "09082",
  });

  var params = {
    headers: {
      "Content-Type": "application/json",
    },
  };

  var url = "http://192.168.2.36:3001/api/fetchByDoctor/";
  let res = http.post(url, payload, params);
  check(res, {
    "is status 200": (r) => r.status === 200,
  });

  console.log(__VU - 1, res.status);
  //sleep(1);
}
