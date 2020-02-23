import React, {Component} from 'react';
import {Text, View, Button} from 'react-native';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import {pbkdf2Sync} from 'crypto';
class Info extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ss: 'asd',
    };
  }
  async componentDidMount() {
    const result = pbkdf2Sync('passwd', '', 1000, 64, 'sha512').toString(
      'base64',
    );
    console.log(result);
    this.setState({ss: result});
  }
  async load() {
    try {
      const credentials = await Keychain.getGenericPassword('SecretKeyDoctor');
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
          FName: {store.getState().authReducer.FName}
        </Text>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          LName: {store.getState().authReducer.LName}
        </Text>
        <Button title="Load Credential." onPress={this.load} />
        <Text>{this.state.ss}</Text>
      </View>
    );
  }
}
export default Info;
