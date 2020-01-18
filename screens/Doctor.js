import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Button} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

class Doctor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isQR: false,
      QRString: 'initial state QRString.',
    };
  }
  onSuccess = e => {
    this.setState({QRString: e.data, isQR: false});
  };
  onQR () {
    this.setState({isQR: true});
  };

  render() {
    return (
      <View>
        <Text style={styles.centerText2}>{this.state.QRString}</Text>
        {this.state.isQR ? (
          <QRCodeScanner
            ref={node => {
              this.scanner = node;
            }}
            onRead={this.onSuccess}
            topContent={
              <Text style={styles.centerText}>Scan Doctor's QRCode.</Text>
            }
            bottomContent={
              <TouchableOpacity
                style={styles.buttonTouchable}
                onPress={this.onSuccess}>
                <Text style={styles.buttonText}>back to Doctor</Text>
              </TouchableOpacity>
            }
          />
        ) : (
          <Button title="Scan QRCode" onPress={this.onQR} />
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
  },
  centerText2: {
    flex: 0,
    fontSize: 18,
    padding: 32,
    textAlign: 'center',
    color: '#rgb(0,122,255)',
  },
  textBold: {
    fontWeight: '500',
    color: '#000',
  },
  buttonText: {
    fontSize: 21,
    color: 'rgb(0,122,255)',
  },
  buttonTouchable: {
    padding: 16,
  },
});
export default Doctor;
