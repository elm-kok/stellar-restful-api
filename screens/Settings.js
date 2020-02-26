import React from 'react';
import {Text, View, StatusBar, Button} from 'react-native';
import {persistor, store} from '../redux/store/store';
import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';
import {clearAll, testAccountInit} from '../stellar';
class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async load() {
    try {
      const credentials = await Keychain.getGenericPassword('StellarSecret');
      if (credentials) {
        console.log({...credentials, status: 'Credentials loaded!'});
      } else {
        console.log({status: 'No credentials stored.'});
      }
    } catch (err) {
      console.log({status: 'Could not load credentials. ' + err});
    }
  }
  render() {
    return (
      <>
        <Text style={{fontSize: 30, color: '#FF4C76', textAlign: 'center'}}>
          Hi, {store.getState().authReducer.FName}{' '}
          {store.getState().authReducer.LName}
        </Text>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <Button title="Remove Account" onPress={() => clearAll()} />
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          ID: {store.getState().authReducer._id}
        </Text>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          FName: {store.getState().authReducer.FName}
        </Text>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          LName: {store.getState().authReducer.LName}
        </Text>
        <Button title="Load Credential." onPress={this.load} />
        <Button
          title="Init Testnet"
          onPress={() =>
            testAccountInit(store.getState().authReducer.stellarPublicKey)
          }
        />
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
