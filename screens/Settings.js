import React from 'react';
import {Text, View, StatusBar, Button} from 'react-native';
import {persistor, store} from '../redux/store/store';
import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';

class Settings extends React.Component {
  componentWillUnmount() {
    this.setState({});
  }
  render() {
    return (
      <View>
        <Text style={{fontSize: 50, color: '#FF4C76', textAlign: 'center'}}>
          Your settings.
        </Text>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <StatusBar barStyle="default" />
      </View>
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
