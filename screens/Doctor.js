import React from 'react';
import {Text, View, TouchableOpacity, StyleSheet, Button} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {submit, getInfo} from '../stellar';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import DoctorDetail from '../screens/DoctorDetail';
class Doctor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isQR: false,
      QRString: 'initial state QRString.',
      result: '',
    };
  }
  onSuccess = e => {
    this.setState({QRString: e.data, isQR: false});
  };
  onQR = () => {
    this.setState({isQR: true});
  };
  onSubmit = async () => {
    try {
      const credentialsStellarSecret = await Keychain.getGenericPassword(
        'StellarSecret',
      );
      const credentialsSecretKey = await Keychain.getGenericPassword(
        'SecretKey',
      );
      if (credentialsStellarSecret && credentialsSecretKey) {
        console.log({
          ...credentialsStellarSecret,
          status: 'Credentials loaded!',
        });
      } else {
        console.log({status: 'No credentials stored. StellarSecret'});
      }
      submit(
        store.getState().authReducer.stellarPublicKey,
        credentialsStellarSecret.password,
        this.state.QRString,
        credentialsSecretKey.password,
      );
    } catch (err) {
      console.log({status: 'Could not load credentials. ' + err});
    }
  };
  onInfo = async () => {
    try {
      const credentialsSecretKey = await Keychain.getGenericPassword(
        'SecretKey',
      );
      if (credentialsSecretKey) {
        console.log({
          ...credentialsSecretKey,
          status: 'Credentials loaded!',
        });
      } else {
        console.log({status: 'No credentials stored.'});
      }
      const info = await getInfo(
        store.getState().authReducer.stellarPublicKey,
        credentialsSecretKey.password,
      );
      console.log('INFO: ', info);
      this.setState({result: info});
    } catch (err) {
      console.log({status: 'Could not load credentials. ' + err});
    }
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
          <>
            <Button title="Scan QRCode" onPress={this.onQR} />
            <Button title="Submit" onPress={this.onSubmit} />
            <Button title="getInfo" onPress={this.onInfo} />
          </>
        )}
        <Text>{this.state.result}</Text>
        <DoctorDetail />
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
