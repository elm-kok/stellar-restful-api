import React, {Component} from 'react';
import {Text, View} from 'react-native';
class Doctor extends React.Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 50, color: '#4CD5FF', textAlign: 'center'}}>
          I am Doctor.
        </Text>
      </View>
    );
  }
}
export default Doctor;
