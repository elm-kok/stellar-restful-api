import React from 'react';
import {
  Text,
  Button,
  Modal,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {persistor, store} from '../redux/store/store';
import AsyncStorage from '@react-native-community/async-storage';
import * as Keychain from 'react-native-keychain';
import {changeMode} from '../redux/actions/authActions';
import {update} from '../redux/actions/authActions';
import Icon from 'react-native-vector-icons/Ionicons';
export default class Settings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {mode: 'Patient', modalVisible: false, statusText: ''};
  }
  componentDidMount = () => {
    this.setState({
      mode: store.getState().authReducer.mode,
      fName: store.getState().authReducer.FName,
      lName: store.getState().authReducer.LName,
    });
  };
  changeName = () => {
    this.setState({modalVisible: true});
  };
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
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.state.modalVisible}
          onRequestClose={() => {
            Alert.alert('Modal has been closed.');
          }}>
          <TouchableOpacity
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              width: 30,
              height: 30,
              position: 'absolute',
              top: 10,
              right: 10,
            }}
            onPress={() => this.setState({modalVisible: false})}>
            <Icon name="ios-close" size={50} color="#01a699" />
          </TouchableOpacity>
          <View
            style={{
              marginTop: 50,
              flex: 1,
            }}>
            <TextInput
              style={{height: 40}}
              placeholder="First Name"
              accessibilityLabel="fName_setting"
              onChangeText={fName => this.setState({fName: fName})}
              value={this.state.fName}
            />
            <TextInput
              style={{height: 40}}
              placeholder="Last Name"
              accessibilityLabel="lName_setting"
              onChangeText={lName => this.setState({lName: lName})}
              value={this.state.lName}
            />
            <Button
              title="Change"
              accessibilityLabel="submit_setting"
              onPress={async () => {
                await store.dispatch(
                  update(this.state.fName, this.state.lName),
                );
                this.setState({modalVisible: false});
              }}
            />
          </View>
        </Modal>
        <Text
          accessibilityLabel="Name_setting"
          style={{
            fontSize: 30,
            color: '#0000ff',
            textAlign: 'right',
            padding: 15,
          }}>
          Hi, {store.getState().authReducer.FName}{' '}
          {store.getState().authReducer.LName}
        </Text>
        <Button
          title="Sign out"
          accessibilityLabel="signOut_setting"
          onPress={this._signOutAsync}
        />
        <Button
          title="Change name"
          accessibilityLabel="changeBt_setting"
          onPress={() => this.changeName()}
        />
        <Button
          accessibilityLabel="changeMode_setting"
          title={this.state.mode + ' Mode'}
          onPress={() => this.changeMode()}
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
