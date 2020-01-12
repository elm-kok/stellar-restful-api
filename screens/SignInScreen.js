import React from 'react';
import {View, Button, TextInput} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

export default class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      passwd: '',
      passwd_com: '',
      SS: 0,
      Name: '',
      Phone: '',
    };
  }
  static navigationOptions = {
    title: 'Please sign in',
  };

  render() {
    return (
      <View>
        <TextInput
          style={{height: 40}}
          placeholder="ID"
          onChangeText={id => this.setState({id: id})}
          value={this.state.id}
        />
        {this.state.SS ? (
          <TextInput
            style={{height: 40}}
            placeholder="Name"
            onChangeText={Name => this.setState({Name: Name})}
            value={this.state.Name}
          />
        ) : null}
        {this.state.SS ? (
          <TextInput
            style={{height: 40}}
            placeholder="Phone"
            onChangeText={Phone => this.setState({Phone: Phone})}
            value={this.state.Phone}
          />
        ) : null}
        <TextInput
          style={{height: 40}}
          placeholder="Password"
          onChangeText={passwd => this.setState({passwd: passwd})}
          value={this.state.passwd}
        />
        {this.state.SS ? (
          <TextInput
            style={{height: 40}}
            placeholder="Confirm Password"
            onChangeText={passwd_com => this.setState({passwd_com: passwd_com})}
            value={this.state.passwd_com}
          />
        ) : null}
        {this.state.SS ? (
          <Button title="Sign in!" onPress={this._sel_SS} />
        ) : (
          <Button title="Sign in" onPress={this._signInAsync} />
        )}
        {this.state.SS ? (
          <Button title="Sign up" onPress={this._signUpAsync} />
        ) : (
          <Button title="Sign up!" onPress={this._sel_SS} />
        )}
      </View>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
  };
  _signUpAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
  };
  _sel_SS = async () => {
    this.setState({SS: !this.state.SS});
  };
}
