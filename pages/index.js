import React, { Component } from "react";
import { Typography, Button, Grid } from "@material-ui/core";
import QRCode from "qrcode.react";
import dynamic from "next/dynamic";

const QrReader = dynamic(() => import("react-qr-reader"), {
  ssr: false
});

export default class QR extends Component {
  state = {
    result: "",
    camera: true,
    msg: ""
  };
  _clear = () => {
    this.setState({ result: "", camera: true, msg: "" });
  };
  handleScan = data => {
    if (data) {
      const dataJson = JSON.parse(data);
      if (dataJson.Type == "Patient") {
        this.setState({
          result: dataJson
        });
        this.setState({ camera: false });
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
              <QRCode size="256" value={this.state.result.Name} />
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
