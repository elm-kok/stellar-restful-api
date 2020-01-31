import React, { Component, View } from "react";
import dynamic from "next/dynamic";
const QrReader = dynamic(() => import("react-qr-reader"), {
  ssr: false
});
export default class QR extends Component {
  state = {
    result: "No result"
  };

  handleScan = data => {
    if (data) {
      this.setState({
        result: data
      });
    }
  };
  handleError = err => {
    console.error(err);
  };
  render() {
    return (
      <>
        <QrReader
          onError={this.handleError}
          onScan={this.handleScan}
          style={{ width: "20%" }}
        />
        <p>{this.state.result}</p>
      </>
    );
  }
}
