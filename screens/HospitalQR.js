import React from 'react';
import {View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import {store} from '../redux/store/store';
import QRCode from 'react-native-qrcode-svg';
import Icon from 'react-native-vector-icons/Ionicons';
import {server} from '../stellar';
import * as Keychain from 'react-native-keychain';
class HospitalQR extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      QRString: 'initial state QRString.',
    };
  }
  async componentDidMount() {
    const result = await this.getQR();
    this.setState({result: result});
  }
  getQR = async () => {
    try {
      const spk = store.getState().authReducer.stellarPublicKey;
      const cid = store.getState().authReducer.cid;
      const name =
        store.getState().authReducer.FName +
        ' ' +
        store.getState().authReducer.LName;
      const seq = (await server.loadAccount(spk)).sequenceNumber();
      const result =
        '{"Type":"Patient","Name":"' +
        name +
        '","SPK":"' +
        spk +
        '","Seq":"' +
        seq +
        '","CID":"' +
        cid +
        '"}';
      return result;
    } catch (err) {
      console.log(err);
    }
  };
  onClose = () => {
    this.props.navigation.navigate('Hospital');
  };
  onNext = () => {
    this.props.navigation.navigate('HospitalScan');
  };
  render() {
    return (
      <>
        {this.state.result ? (
          <>
            <Text
              style={{
                top: 80,
                textAlign: 'center', // <-- the magic
                fontSize: 24,
              }}>
              For Hospital Scanning...
            </Text>
            <View
              style={{
                width: '100%',
                height: '100%',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <QRCode value={this.state.result} size={350} />
            </View>
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
              <Icon name="ios-close" size={50} color="#e3a699" />
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                width: 30,
                height: 30,
                position: 'absolute',
                bottom: 10,
                right: 10,
              }}
              onPress={this.onNext}>
              <Icon name="ios-arrow-round-forward" size={50} color="#01a699" />
            </TouchableOpacity>
          </>
        ) : null}
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
