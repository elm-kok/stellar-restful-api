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
  handleScan = data => {
    if (data) {
      const dataJson = JSON.parse(data);
      if (dataJson.Type == "Patient") {
        const KP = StellarSdk.Keypair.fromSecret(SecretKey);
        this.setState({
          result: dataJson,
          QR: JSON.stringify({
            Type: "Hospital",
            HospitalName: "Chulalongkorn Hospital",
            EndPoint: "chulalongkornhospital.go.th/patientID_",
            SPK: PublicKey,
            Signature: KP.sign(
              Buffer.from(dataJson.ID + dataJson.SPK)
            ).toString("base64")
          }),
          camera: false,
          msg: ""
        });
        //ins(dataJson.ID, dataJson.SPK, dataJson.SecretKey);
        fetch("http://localhost:3001/api/secret", {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            cid: dataJson.ID,
            HOSPCODE: HOSPCODE,
            spk: dataJson.SPK,
            secretkey: dataJson.SecretKey
          })
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
