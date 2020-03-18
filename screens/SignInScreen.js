import React from 'react';
import {View, Button, TextInput} from 'react-native';
import {connect} from 'react-redux';
import {login} from '../redux/actions/authActions';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import {createHash, randomBytes, pbkdf2Sync} from 'crypto';
import {StellarSdk} from '../stellar';

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
      con_passwd: '',
      fName: '',
      lName: '',
      mode: 'Doctor',
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
        <TextInput
          style={{height: 40}}
          placeholder="Password"
          onChangeText={passwd => this.setState({passwd: passwd})}
          value={this.state.passwd}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Confirm Password"
          onChangeText={con_passwd => this.setState({con_passwd: con_passwd})}
          value={this.state.con_passwd}
        />
        <TextInput
          style={{height: 40}}
          placeholder="First Name"
          onChangeText={fName => this.setState({fName: fName})}
          value={this.state.fName}
        />
        <TextInput
          style={{height: 40}}
          placeholder="Last Name"
          onChangeText={lName => this.setState({lName: lName})}
          value={this.state.lName}
        />
        <Button title="Sign in" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    /*
    const hashId = await createHash('sha256')
      .update(this.state._id + this.state.passwd, 'utf-8')
      .digest();
      */
    const hashId_raw = pbkdf2Sync(
      this.state._id + this.state.passwd,
      '',
      1000,
      64,
      'sha512',
    );
    console.log(hashId_raw.toString('base64'));
    const hashId = createHash('sha256')
      .update(hashId_raw)
      .digest();
    const arrByte = Uint8Array.from(hashId);
    const stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(arrByte);
    const keyHospital = randomBytes(32).toString('base64');
    const keyDoctor = randomBytes(32).toString('base64');
    await Keychain.setGenericPassword(this.state._id, keyHospital, {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'SecretKeyHospital',
    });
    await Keychain.setGenericPassword(this.state._id, keyDoctor, {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'SecretKeyDoctor',
    });
    await Keychain.setGenericPassword(this.state._id, stellarKeyPair.secret(), {
      accessControl: Keychain.ACCESS_CONTROL.DEVICE_PASSCODE,
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'StellarSecret',
    });
    await this.props.reduxLogin(
      this.state._id,
      this.state.fName,
      this.state.lName,
      stellarKeyPair.publicKey(),
      this.state.mode,
    );
    if (store.getState().authReducer.loggedIn) {
      this.props.navigation.navigate('App');
    }
  };
}
const mapStateToProps = state => {
  return {
    _id: state.authReducer._id,
    FName: state.authReducer.fName,
    LName: state.authReducer.lName,
    mode: state.authReducer.mode,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    reduxLogin: (_id, fName, lName, stellarPublicKey, mode) =>
      dispatch(login(_id, fName, lName, stellarPublicKey, mode)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
