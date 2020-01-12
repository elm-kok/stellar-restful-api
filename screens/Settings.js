import React, {Component} from 'react';
import {Text, View, StatusBar, Button} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class Settings extends React.Component {
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
    this.props.navigation.navigate('Auth');
  };
}
export default Settings;
