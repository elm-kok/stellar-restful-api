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
import {addDoctor, updateDoctor} from '../redux/actions/doctorAction';
import {pbkdf2Sync} from 'crypto';
class DoctorQR extends React.Component {
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
    this.props.navigation.navigate('Doctor');
  };
  onSuccess = e => {
    this.setState({QRString: JSON.parse(e.data), modalVisible: true});
    //this.props.navigation.navigate('Doctor');
  };
  onSubmit = async () => {
    try {
      var check = -1;
      var i;
      var doctor = store.getState().doctorReducer.DoctorList;
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
      for (i = 0; i < doctor.length; ++i) {
        if (this.state.QRString.name === doctor[i].name) {
          check = i;
          await clearInfo(spk, StellarSecret, doctor[i].seq_sig);
          break;
        }
      }

      this.setState({statusText: 'Upload Signature...'});
      const sig = JSON.stringify({
        Signature: pbkdf2Sync(
          this.state.QRString.sig,
          '',
          1000,
          64,
          'sha512',
        ).toString('hex'),
        Status: 1,
      });
      const seq_sig = await submitWithoutEncrypt(spk, StellarSecret, sig);

      if (!seq_sig) {
        this.setState({modalVisible2: false});
        return;
      }
      console.log('FOUND duplicate: ', check);
      this.setState({statusText: 'Dispatch Doctor...'});
      if (check > -1) {
        doctor[check].seq_sig = seq_sig;
        doctor[check].date = new Date().toString();
        await store.dispatch(updateDoctor(doctor));
      } else {
        await store.dispatch(
          addDoctor(seq_sig, this.state.QRString.name, new Date().toString()),
        );
      }
      this.setState({modalVisible2: false});
      console.log(store.getState().doctorReducer.DoctorList);
      this.props.navigation.navigate('Doctor');
    } catch (err) {
      this.setState({modalVisible2: false});
      this.props.navigation.navigate('Doctor');
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
              <Text style={styles.centerText}>Scan Doctor's QRCode.</Text>
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
            <Text style={{fontSize: 24}}>Add {this.state.QRString.name}</Text>

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

export default DoctorQR;
