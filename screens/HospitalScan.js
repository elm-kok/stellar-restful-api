import React from 'react';
import {Text, StyleSheet, TouchableOpacity} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {submit} from '../stellar';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Ionicons';

class HospitalQR extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      QRString: 'initial state QRString.',
    };
  }
  onClose = () => {
    this.props.navigation.navigate('Hospital');
  };
  onSuccess = e => {
    this.setState({QRString: e.data, isQR: false});
    this.props.navigation.navigate('Hospital');
  };
  onSubmit = async () => {
    try {
      const credentialsStellarSecret = await Keychain.getGenericPassword(
        'StellarSecret',
      );
      const credentialsSecretKey = await Keychain.getGenericPassword(
        'SecretKeyDoctor',
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
  render() {
    return (
      <>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            height: 30,
            position: 'absolute',
            top: 10,
            right: 10,
          }}
          onPress={this.onClose}>
          <Icon name="ios-close" size={50} color="#01a699" />
        </TouchableOpacity>
        <QRCodeScanner
          ref={node => {
            this.scanner = node;
          }}
          onRead={this.onSuccess}
          topContent={
            <Text style={styles.centerText}>Scan Hospital's QRCode.</Text>
          }
        />
      </>
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
export default HospitalQR;
