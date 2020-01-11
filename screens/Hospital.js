import React, {Component} from 'react';
import {Text, View} from 'react-native';
class Hospital extends React.Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 50, color: '#FF9A4C', textAlign: 'center'}}>
          Where is your medical record.
        </Text>
      </View>
    );
  }
}
export default Hospital;
