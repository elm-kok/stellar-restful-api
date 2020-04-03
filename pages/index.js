import React, { Component } from "react";
import { Typography, Button, Grid } from "@material-ui/core";
import QRCode from "qrcode.react";
import dynamic from "next/dynamic";
import { HOSPCODE, HOSPNAME } from "../stellar";

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
            CID: dataJson.CID,
            SPK: dataJson.SPK,
            Seq: dataJson.Seq
          })
        })
          .then(response => response.json())
          .then(async responseJson => {
            this.setState({
              result: dataJson,
              QR: JSON.stringify({
                Type: "Hospital",
                Name: HOSPNAME,
                Endpoint: "http://localhost:3001/api/",
                HOSPCODE: HOSPCODE,
                Signature: responseJson.Secret
              }),
              camera: false,
              msg: ""
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
                <Typography variant="h3">{this.state.result.name}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h3">
                  ID: {this.state.result.cid}
                </Typography>
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
