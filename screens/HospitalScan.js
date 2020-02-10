import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {submit} from '../stellar';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Ionicons';
import {server} from '../stellar';
import {addHospital} from '../redux/actions/hospitalAction';

class HospitalQR extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      QRString: 'initial state QRString.',
      modalVisible: false,
      modalVisible2: false,
      statusText: '',
    };
  }
  onClose = () => {
    this.props.navigation.navigate('Hospital');
  };
  onSuccess = e => {
    this.setState({QRString: JSON.parse(e.data), modalVisible: true});
    //this.props.navigation.navigate('Hospital');
  };
  onSubmit = async () => {
    try {
      this.setState({
        modalVisible: false,
        modalVisible2: true,
        statusText: 'Preparing...',
      });
      const spk = store.getState().authReducer.stellarPublicKey;
      const StellarSecret = await Keychain.getGenericPassword('StellarSecret');
      const SecretKeyDoctor = await Keychain.getGenericPassword(
        'SecretKeyDoctor',
      );
      const SecretKeyHospital = await Keychain.getGenericPassword(
        'SecretKeyHospital',
      );
      this.setState({statusText: 'Upload Signature...'});
      const sig = JSON.stringify({
        Signature: this.state.QRString.Signature,
        Status: 1,
      });
      const seq_sig = await submit(
        store.getState().authReducer.stellarPublicKey,
        StellarSecret.password,
        sig,
        SecretKeyHospital.password,
      );
      this.setState({statusText: 'Upload EndPoint...'});
      var endpoint = this.state.QRString;
      delete endpoint['Signature'];
      const seq_end = await submit(
        store.getState().authReducer.stellarPublicKey,
        StellarSecret.password,
        JSON.stringify(endpoint),
        SecretKeyDoctor.password,
      );
      if (!seq_end || !seq_sig) {
        this.setState({modalVisible2: false});
        return;
      }
      this.setState({statusText: 'Dispatch EndPoint...'});
      await store.dispatch(
        addHospital(seq_sig, seq_end, endpoint.HospitalName, endpoint.EndPoint),
      );
      this.setState({modalVisible2: false});
      console.log(store.getState().hospitalReducer.HospitalList);
      this.props.navigation.navigate('Hospital');
    } catch (err) {
      this.setState({modalVisible2: false});
      this.props.navigation.navigate('Hospital');
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
        {!this.state.modalVisible && !this.state.modalVisible2 ? (
          <QRCodeScanner
            ref={node => {
              this.scanner = node;
            }}
            onRead={this.onSuccess}
            topContent={
              <Text style={styles.centerText}>Scan Hospital's QRCode.</Text>
            }
          />
        ) : null}
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <>
            <Text style={{fontSize: 24}}>
              Add {this.state.QRString.HospitalName}
            </Text>
            <Text style={{fontSize: 24}}>
              End point {this.state.QRString.EndPoint}
            </Text>

            <TouchableOpacity
              onPress={this.onSubmit}
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                position: 'absolute',
                bottom: 10,
                right: 10,
              }}>
              <Icon name="ios-checkmark" size={50} color="#01a699" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                position: 'absolute',
                bottom: 10,
                right: 50,
              }}
              onPress={() => {
                this.setState({modalVisible: false});
              }}>
              <Icon name="ios-close" size={50} color="#01a699" />
            </TouchableOpacity>
          </>
        </Modal>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible2}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <Text
            style={{
              fontSize: 24,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 100,
            }}>
            {this.state.statusText}
          </Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </Modal>
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
