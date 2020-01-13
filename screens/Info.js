import React, {Component} from 'react';
import {Text, View} from 'react-native';
class Info extends React.Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 50, color: '#4CD5FF', textAlign: 'center'}}>
          Your Information.
        </Text>
      </View>
    );
  }
}
export default Info;
