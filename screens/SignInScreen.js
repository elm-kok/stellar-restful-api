import React from 'react';
import {View, Button, TextInput} from 'react-native';
import {connect} from 'react-redux';
import {login} from '../redux/actions/authActions';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import {createHash} from 'crypto';
import {StellarSdk, apiServer, server} from '../stellar';
import {RSA} from 'react-native-rsa-native';
import { stat } from 'fs';

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
      FName: '',
      LName: '',
      Phone: '',
    };
  }
  componentWillUnmount() {
    this.setState({});
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
            placeholder="FName"
            onChangeText={FName => this.setState({FName: FName})}
            value={this.state.FName}
          />
        ) : null}
        {this.state.SS ? (
          <TextInput
            style={{height: 40}}
            placeholder="LName"
            onChangeText={LName => this.setState({LName: LName})}
            value={this.state.LName}
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
  _setUpAsync = async () => {
    const hashId = await createHash('sha256')
      .update(this.state._id + this.state.passwd, 'utf-8')
      .digest();
    const arrByte = Uint8Array.from(hashId);
    var stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(arrByte);
    const RsaKeyPair = await RSA.generateKeys(2048);

    return {stellarKeyPair: stellarKeyPair, RsaKeyPair: RsaKeyPair};
  };

  _signInAsync = async () => {
    const {stellarKeyPair, RsaKeyPair} = await this._setUpAsync();
    const signature = stellarKeyPair.sign(RsaKeyPair.public).toString('base64');
    const request = new Request(apiServer + '/Patient/Login', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        StellarPub: stellarKeyPair.publicKey(),
        ServerPub: RsaKeyPair.public,
        Signature: signature,
      }),
    });

    await fetch(request)
      .then(response => {
        if (response.status === 200) {
          return response.json();
        } else {
          console.log(response.status, 'Account not exist.');
        }
      })
      .then(response => {
        RSA.decrypt(response, RsaKeyPair.private).then(decryptedMessage => {
          Keychain.setGenericPassword(this.state._id, decryptedMessage, {
            accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
            securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
            service: 'SecretKey',
          });
        });
        await this.props.reduxLogin(
          this.state._id,
          response.fName,
          response.lName,
          response.phone,
          RsaKeyPair.public,
          stellarKeyPair.publicKey(),
        );
      })
      .catch(error => {
        console.log(error);
      });
    await Keychain.setGenericPassword(this.state._id, stellarKeyPair.secret(), {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'StellarSecret',
    });
    await Keychain.setGenericPassword(this.state._id, RsaKeyPair.private, {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'ServerPrivateKey',
    });
    if (store.getState().authReducer.loggedIn) {
      this.props.navigation.navigate('App');
    }
  };

  _signUpAsync = async () => {
    const {stellarKeyPair, RsaKeyPair} = await this._setUpAsync();
    const signature = stellarKeyPair.sign(RsaKeyPair.public).toString('base64');
    const request = new Request(apiServer + '/Patient/Register', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        StellarPub: stellarKeyPair.publicKey(),
        ServerPub: RsaKeyPair.public,
        FName: this.state.FName,
        LName: this.state.LName,
        Phone: this.state.Phone,
        Signature: signature,
      }),
    });
    await fetch(request)
      .then(response => {
        if (response.status === 201) {
          return response.json();
        } else {
          console.log(response.status, 'Account already exist.');
        }
      })
      .then(response => {
        RSA.decrypt(response, RsaKeyPair.private).then(decryptedMessage => {
          Keychain.setGenericPassword(this.state._id, decryptedMessage, {
            accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
            securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
            service: 'SecretKey',
          });
        });
      })
      .catch(error => {
        console.log(error, 'Account already fund.');
      });
    this.setState({SS: 0});
  };

  _sel_SS = async () => {
    this.setState({SS: !this.state.SS});
  };
}
const mapStateToProps = state => {
  // Redux Store --> Component
  return {
    _id: state.authReducer._id,
    FName:state.authReducer.fName,
    LName:state.authReducer.lName,
    Phone:state.authReducer.phone
  };
};

// Map Dispatch To Props (Dispatch Actions To Reducers. Reducers Then Modify The Data And Assign It To Your Props)
const mapDispatchToProps = dispatch => {
  // Action
  return {
    // Login
    reduxLogin: (_id, fName, lName, phone, serverPublicKey, stellarPublicKey) =>
      dispatch(
        login(_id, fName, lName, phone, serverPublicKey, stellarPublicKey),
      ),
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
