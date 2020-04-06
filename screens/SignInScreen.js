import React from 'react';
import {
  View,
  Button,
  TextInput,
  Modal,
  ActivityIndicator,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {connect} from 'react-redux';
import {login} from '../redux/actions/authActions';
import {store} from '../redux/store/store';
import * as Keychain from 'react-native-keychain';
import {createHash, randomBytes, pbkdf2Sync} from 'crypto';
import {StellarSdk, cleanAccount} from '../stellar';
import {Colors} from 'react-native/Libraries/NewAppScreen';

export class SignInScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cid: '',
      passwd: '',
      con_passwd: '',
      fName: '',
      lName: '',
      mode: 'Doctor',
      modalVisible: false,
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
      <>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
            accessibilityLabel = 'modal';
          }}>
          <Text
            style={{
              fontSize: 24,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 100,
            }}
            accessibilityLabel="statusText">
            {this.state.statusText}
          </Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </Modal>
        <SafeAreaView style={styles.container}>
          <ScrollView
            contentInsetAdjustmentBehavior="automatic"
            style={styles.scrollView}>
            <Text style={styles.heading}>Record Controller</Text>
            <Text style={styles.mt12}>CID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="CID"
              onChangeText={(cid) => this.setState({cid: cid})}
              value={this.state.cid}
              accessibilityLabel="ID"
            />
            <Text style={styles.mt12}>Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Password"
              onChangeText={(passwd) => this.setState({passwd: passwd})}
              value={this.state.passwd}
              accessibilityLabel="password"
            />
            <Text style={styles.mt12}>Confirm Password</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Confirm Password"
              onChangeText={(con_passwd) =>
                this.setState({con_passwd: con_passwd})
              }
              value={this.state.con_passwd}
              accessibilityLabel="conPassword"
            />
            <Text style={styles.mt12}>First Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="First Name"
              onChangeText={(fName) => this.setState({fName: fName})}
              value={this.state.fName}
              accessibilityLabel="fName"
            />
            <Text style={styles.mt12}>Last Name</Text>
            <TextInput
              style={[styles.textInput, styles.mb12]}
              placeholder="Last Name"
              onChangeText={(lName) => this.setState({lName: lName})}
              value={this.state.lName}
              accessibilityLabel="lName"
            />
            <Button
              title="Sign in"
              onPress={this._signInAsync}
              id="login"
              accessibilityLabel="login"
            />
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  _signInAsync = async () => {
    /*
    const hashId = await createHash('sha256')
      .update(this.state.cid + this.state.passwd, 'utf-8')
      .digest();
      */
    this.setState({modalVisible: true, statusText: 'Hashing Seed...'});
    const hashId_raw = pbkdf2Sync(
      this.state.cid + this.state.passwd,
      '',
      1000,
      64,
      'sha512',
    );
    console.log(hashId_raw.toString('base64'));
    const hashId = createHash('sha256').update(hashId_raw).digest();
    const arrByte = Uint8Array.from(hashId);
    const stellarKeyPair = await StellarSdk.Keypair.fromRawEd25519Seed(arrByte);
    const keyDoctor = randomBytes(32).toString('base64');
    this.setState({statusText: 'Collecting Secret...'});
    await Keychain.setGenericPassword(this.state.cid, keyDoctor, {
      accessControl: 'DevicePasscode',
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'SecretKeyDoctor',
    });
    await Keychain.setGenericPassword(this.state.cid, stellarKeyPair.secret(), {
      accessControl: 'DevicePasscode',
      securityLevel: Keychain.SECURITY_LEVEL.SECURE_SOFTWARE,
      service: 'StellarSecret',
    });
    this.setState({statusText: 'Cleaning Account...'});
    await cleanAccount(stellarKeyPair.publicKey(), stellarKeyPair.secret());
    this.setState({modalVisible: false});
    await this.props.reduxLogin(
      this.state.cid,
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
const mapStateToProps = (state) => {
  return {
    cid: state.authReducer.cid,
    FName: state.authReducer.fName,
    LName: state.authReducer.lName,
    mode: state.authReducer.mode,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    reduxLogin: (cid, fName, lName, stellarPublicKey, mode) =>
      dispatch(login(cid, fName, lName, stellarPublicKey, mode)),
  };
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    backgroundColor: Colors.white,
    padding: 16,
  },
  heading: {
    textAlign: 'center',
    fontSize: 18,
  },
  textInput: {
    borderColor: Colors.lighter,
    borderWidth: 1,
    borderRadius: 4,
    paddingLeft: 10,
    paddingTop: 4,
    paddingRight: 4,
    paddingBottom: 4,
  },
  mt12: {
    marginTop: 12,
  },
  mb12: {
    marginBottom: 12,
  },
  link: {
    color: '#3543bf',
  },
});
export default connect(mapStateToProps, mapDispatchToProps)(SignInScreen);
