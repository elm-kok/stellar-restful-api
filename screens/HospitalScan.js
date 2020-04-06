import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {submit, submitWithoutEncrypt} from '../stellar';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import Icon from 'react-native-vector-icons/Ionicons';
import {clearInfo} from '../stellar';
import {addHospital, updateHospital} from '../redux/actions/hospitalAction';
import {server} from '../stellar';
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
  onSuccess = (e) => {
    const qrcode_json = JSON.parse(e.data);
    if (qrcode_json.Type === 'Hospital')
      this.setState({QRString: qrcode_json, modalVisible: true});
    //this.props.navigation.navigate('Hospital');
  };
  onSubmit = async () => {
    try {
      var check = -1;
      var i;
      var hospital = store.getState().hospitalReducer.HospitalList;
      this.setState({
        modalVisible: false,
        modalVisible2: true,
        statusText: 'Preparing...',
      });
      const spk = store.getState().authReducer.stellarPublicKey;
      const StellarSecret = (await Keychain.getGenericPassword('StellarSecret'))
        .password;
      const SecretKeyDoctor = (
        await Keychain.getGenericPassword('SecretKeyDoctor')
      ).password;
      for (i = 0; i < hospital.length; ++i) {
        if (this.state.QRString.Name === hospital[i].name) {
          check = i;
          await clearInfo(spk, StellarSecret, hospital[i].seq_sig);
          await clearInfo(spk, StellarSecret, hospital[i].seq_end);
          hospital[i].endPoint = this.state.QRString.Endpoint;
          hospital[i].hospCode = this.state.QRString.HOSPCODE;
          break;
        }
      }
      this.setState({statusText: 'Upload Signature...'});
      const sig = JSON.stringify({
        Signature: this.state.QRString.Signature,
        Status: 1,
      });
      let seq_sig = false;
      const account = await server.loadAccount(spk);
      let seq = account.sequenceNumber();
      while (!seq_sig) {
        seq_sig = await submitWithoutEncrypt(
          spk,
          StellarSecret,
          sig,
          seq,
          account,
        );
      }
      this.setState({statusText: 'Upload EndPoint...'});
      var endpoint = this.state.QRString;
      delete endpoint['Signature'];
      let seq_end = false;
      seq = account.sequenceNumber();
      while (!seq_end) {
        seq_end = await submit(
          spk,
          StellarSecret,
          JSON.stringify(endpoint),
          SecretKeyDoctor,
          seq,
          account,
        );
      }
      if (!seq_end || !seq_sig) {
        this.setState({modalVisible2: false});
        return;
      }
      console.log('FOUND duplicate: ', check);
      this.setState({statusText: 'Dispatch EndPoint...'});
      if (check > -1) {
        hospital[check].seq_sig = seq_sig;
        hospital[check].seq_end = seq_end;
        hospital[check].date = new Date().toString();
        await store.dispatch(updateHospital(hospital));
      } else {
        await store.dispatch(
          addHospital(
            seq_sig,
            seq_end,
            endpoint.Name,
            endpoint.HOSPCODE,
            endpoint.Endpoint,
            new Date().toString(),
          ),
        );
      }
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
            ref={(node) => {
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
            <Text style={{fontSize: 24}}>Add {this.state.QRString.Name}</Text>
            <Text style={{fontSize: 24}}>
              End point {this.state.QRString.Endpoint}
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
              }}
              accessibilityLabel="add_hospitalScan">
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