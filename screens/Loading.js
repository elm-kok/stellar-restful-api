import React, {Component} from 'react';
import {Text, View} from 'react-native';
class Loading extends React.Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 50, color: 'red', textAlign: 'center'}}>
          Loading...
        </Text>
      </View>
    );
  }
}
export default Loading;
