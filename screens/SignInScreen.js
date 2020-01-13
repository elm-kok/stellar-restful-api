import React from 'react';
import {View, Button, TextInput} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {connect} from 'react-redux';
import {login} from '../redux/actions/authActions';

class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      _id: '',
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
          onChangeText={_id => this.setState({_id: _id})}
          value={this.state._id}
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
          <Button title="Sign up" onPress={this._signInAsync} />
        ) : (
          <Button title="Sign up!" onPress={this._sel_SS} />
        )}
      </View>
    );
  }

  _signInAsync = async () => {
    //await AsyncStorage.setItem('userToken', 'abc');
    this.props.reduxLogin(this.state._id, this.state.passwd);
    this.props.navigation.navigate('App');
  };
  _signUpAsync = async () => {
    //await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
  };

  _sel_SS = async () => {
    this.setState({SS: !this.state.SS});
  };
}
const mapStateToProps = state => {
  // Redux Store --> Component
  return {
    _id: state.authReducer._id,
    passwd: state.authReducer.passwd,
  };
};

// Map Dispatch To Props (Dispatch Actions To Reducers. Reducers Then Modify The Data And Assign It To Your Props)
const mapDispatchToProps = dispatch => {
  // Action
  return {
    // Login
    reduxLogin: (_id, passwd) => dispatch(login(_id, passwd)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
