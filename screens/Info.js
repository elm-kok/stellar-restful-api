import React, {Component} from 'react';
import {Text, View} from 'react-native';
import {store} from '../redux/store/store';
class Info extends React.Component {
  render() {
    return (
      <View>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          ID: {store.getState().authReducer._id}
        </Text>
        <Text style={{fontSize: 30, color: '#4CD5FF', textAlign: 'center'}}>
          Password: {store.getState().authReducer.passwd}
        </Text>
      </View>
    );
  }
}
export default Info;
