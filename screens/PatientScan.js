import React from 'react';
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import {store} from '../redux/store/store';
import Icon from 'react-native-vector-icons/Ionicons';
import {addPatient, updatePatient} from '../redux/actions/patientAction';

class PatientQR extends React.Component {
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
  };
  onSubmit = async () => {
    try {
      var check = -1;
      var i;
      var patient = store.getState().patientReducer.PatientList;
      this.setState({
        modalVisible: false,
        modalVisible2: true,
        statusText: 'Preparing...',
      });
      for (i = 0; i < patient.length; ++i) {
        if (
          this.state.QRString.spk === patient[i].spk
        ) {
          check = i;
          break;
        }
      }
      console.log('FOUND duplicate: ', check);
      this.setState({statusText: 'Dispatch Patient...'});
      if (check > -1) {
        patient[check].seq = this.state.QRString.seq;
        patient[check].name = this.state.QRString.name;
        patient[check].secretKey = this.state.QRString.secretKey;
        patient[check].spk = this.state.QRString.spk;
        patient[check].date = new Date().toString();
        await store.dispatch(updatePatient(patient));
      } else {
        await store.dispatch(
          addPatient(
            this.state.QRString.seq,
            this.state.QRString.name,
            this.state.QRString.spk,
            this.state.QRString.secretKey,
            new Date().toString(),
          ),
        );
      }
      this.setState({modalVisible2: false});
      console.log(store.getState().patientReducer.PatientList);
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
              <Text style={styles.centerText}>Scan Patient's QRCode.</Text>
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

export default PatientQR;
