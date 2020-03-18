import React from 'react';
import {Text, Button} from 'react-native';
import {persistor, store} from '../redux/store/store';
import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';
import {testAccountInit} from '../stellar';
import {changeMode} from '../redux/actions/authActions';

export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {mode: 'Patient'};
  }
  componentDidMount = () => {
    this.setState({mode: store.getState().authReducer.mode});
  };
  changeName = () => {};
  changeMode = async () => {
    if (this.state.mode == 'Patient')
      await store.dispatch(changeMode('Doctor'));
    else await store.dispatch(changeMode('Patient'));
    this.setState({mode: store.getState().authReducer.mode});
    this.props.navigation.navigate('Doctor');
  };
  render() {
    return (
      <>
        <Text
          style={{
            fontSize: 30,
            color: '#0000ff',
            textAlign: 'right',
            padding: 15,
          }}>
          Hi, {store.getState().authReducer.FName}{' '}
          {store.getState().authReducer.LName}
        </Text>
        <Button title="I'm done, sign me out" onPress={this._signOutAsync} />
        <Button title="change name" onPress={() => this.changeName()} />
        <Button
          title={this.state.mode + ' Mode'}
          onPress={() => this.changeMode()}
        />
        <Button
          title="Init Testnet (debug)"
          onPress={() =>
            testAccountInit(store.getState().authReducer.stellarPublicKey)
          }
        />
      </>
    );
  }
  _signOutAsync = async () => {
    await AsyncStorage.clear();
    await persistor.purge();
    await persistor.flush();
    await Keychain.resetGenericPassword();
    console.log(store.getState());
    this.props.navigation.navigate('Auth');
  };
}
