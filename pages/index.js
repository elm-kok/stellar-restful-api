import React, { Component } from "react";
import { Typography, Button, Grid } from "@material-ui/core";
import QRCode from "qrcode.react";
import dynamic from "next/dynamic";
import { PublicKey, SecretKey, HOSPCODE } from "../stellar";

const StellarSdk = require("stellar-sdk");
const QrReader = dynamic(() => import("react-qr-reader"), {
  ssr: false
});

export default class QR extends Component {
  state = {
    result: "",
    camera: true,
    msg: "",
    QR: {}
  };
  _clear = () => {
    this.setState({ result: "", camera: true, msg: "", QR: {} });
  };
  handleScan = async data => {
    if (data) {
      const dataJson = await JSON.parse(data);
      if (dataJson.Type == "Patient") {
        await fetch("http://localhost:3001/api/findPID", {
          method: "post",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            HOSPCODE: HOSPCODE,
            ID: dataJson.ID
          })
        })
          .then(response => response.json())
          .then(async responseJson => {
            console.log("response object:", responseJson.PID);
            const KP = StellarSdk.Keypair.fromSecret(SecretKey);
            this.setState({
              result: dataJson,
              QR: JSON.stringify({
                Type: "Hospital",
                HospitalName: "Chulalongkorn Hospital",
                EndPoint: "http://localhost:3001/api/",
                HOSCODE: HOSPCODE,
                PID: responseJson.PID,
                //SPK: PublicKey,
                Signature: KP.sign(
                  Buffer.from(
                    responseJson.PID + "_" + dataJson.SPK + "_" + dataJson.Key
                  )
                ).toString("base64")
              }),
              camera: false,
              msg: ""
            });
            //ins(dataJson.ID, dataJson.SPK, dataJson.SecretKey);
            await fetch("http://localhost:3001/api/secret", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                pid: dataJson.PID,
                HOSPCODE: HOSPCODE,
                spk: dataJson.SPK,
                key: dataJson.key,
                secretkey: dataJson.SecretKey
              })
            });
          });
      } else {
        this.setState({
          msg: "Wrong QRCode."
        });
      }
    }
  };
  handleError = err => {
    console.error(err);
  };
  render() {
    return (
      <>
        {this.state.camera ? (
          <Grid container spacing={5} style={{ padding: 50 }}>
            <Grid item xs={6}>
              <QrReader
                onError={this.handleError}
                onScan={this.handleScan}
                style={{ width: "70%" }}
              />
              <Typography variant="h3">{this.state.msg}</Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h3">Scan your QRCode.</Typography>
            </Grid>
          </Grid>
        ) : (
          <Grid container spacing={5} style={{ padding: 50 }}>
            <Grid item xs={6}>
              <QRCode size="256" value={this.state.QR} />
            </Grid>
            <Grid item xs={6}>
              <Grid item xs={12}>
                <Typography variant="h3">{this.state.result.Name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h3">ID: {this.state.result.ID}</Typography>
              </Grid>
              <Grid item xs={12} style={{ paddingTop: 30 }}>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={this._clear}
                >
                  CLEAR
                </Button>
              </Grid>
            </Grid>
          </Grid>
        )}
      </>
    );
  }
}
