import React, {Component} from 'react';
import {Text, View} from 'react-native';
class Settings extends React.Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 50, color: '#FF4C76', textAlign: 'center'}}>
          Your settings.
        </Text>
      </View>
    );
  }
}
export default Settings;
