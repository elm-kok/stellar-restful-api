import React from 'react';
import {View, Button, TextInput} from 'react-native';
import {connect} from 'react-redux';
import {login} from '../redux/actions/authActions';
import {store} from '../redux/store/store';
import {RSA} from 'react-native-rsa-native';
import * as Keychain from 'react-native-keychain';

const ACCESS_CONTROL_OPTIONS = ['None', 'Passcode', 'Password'];
const ACCESS_CONTROL_MAP = [
  null,
  Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
  Keychain.ACCESS_CONTROL.APPLICATION_PASSWORD,
  Keychain.ACCESS_CONTROL.BIOMETRY_CURRENT_SET,
];

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
    let keypair = await RSA.generate(); // set key size

    await Keychain.setGenericPassword(this.state._id, this.state.passwd, {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'StellarKeypair',
    });

    await Keychain.setGenericPassword(this.state._id, keypair.private, {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'PrivateKey',
    });
    
    await this.props.reduxLogin(
      this.state._id,
      this.state.passwd,
      keypair.private,
      keypair.public,
    );
    if (store.getState().authReducer.loggedIn) {
      this.props.navigation.navigate('App');
    }
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
    reduxLogin: (_id, passwd, privateKey, publicKey) =>
      dispatch(login(_id, passwd, privateKey, publicKey)),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
