import React from 'react';
import {Text, View, StatusBar, Button} from 'react-native';
import {persistor, store} from '../redux/store/store';
import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';
import QRCode from 'react-native-qrcode-svg';
import {server} from '../stellar';
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      qrcode: 'asd',
    };
  }
  async componentDidMount() {
    const spk = await store.getState().authReducer.stellarPublicKey;
    const cid = await store.getState().authReducer._id;
    const name =
      (await store.getState().authReducer.FName) +
      ' ' +
      store.getState().authReducer.LName;
    const seq = (await server.loadAccount(spk)).sequenceNumber();
    const qrJson_raw =
      '{"type":"Patient","name":"' +
      name +
      '","spk":"' +
      spk +
      '","seq":"' +
      seq +
      '","cid":"' +
      cid +
      '"}';
    this.setState({qrcode: qrJson_raw});
    console.log(this.state.qrcode);
  }
  render() {
    return (
      <>
        <Text style={{fontSize: 30, color: '#FF4C76', textAlign: 'center'}}>
          Hi, {store.getState().authReducer.FName}{' '}
          {store.getState().authReducer.LName}
        </Text>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <View
          style={{
            width: '100%',
            height: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <QRCode value={this.state.qrcode} />
        </View>
      </>
    );
  }
  _signOutAsync = async () => {
    await AsyncStorage.clear();
    await persistor.purge();
    await persistor.flush();
    await Keychain.resetGenericPassword();
    console.log(store.getState());
    this.props.navigation.navigate('Auth');
  };
}

export default Settings;
