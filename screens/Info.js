import React, {Component} from 'react';
import {Text, View, Button} from 'react-native';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';

class Info extends React.Component {
  async load() {
    try {
      const credentials = await Keychain.getGenericPassword('PrivateKey');
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
      <View>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          ID: {store.getState().authReducer._id}
        </Text>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          Password: {store.getState().authReducer.passwd}
        </Text>
        <Button title="Load Cre" onPress={this.load} />
      </View>
    );
  }
}
export default Info;
