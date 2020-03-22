import React from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
} from 'react-native';
import {ListItem} from 'react-native-elements';
import {store} from '../redux/store/store';
import {updateDoctor} from '../redux/actions/doctorAction';
import {
  getInfoByKeyWithoutEncrypt,
  submitByKeyWithoutEncrypt,
  clearInfo,
} from '../stellar';
import * as Keychain from 'react-native-keychain';

export default class Doctor_logic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {doctorList: [], modalVisible: false};
  }
  componentDidMount() {
    this.setState({
      doctorList: store.getState().doctorReducer.DoctorList,
    });
  }

  async disableRow(seq_sig) {
    try {
      this.setState({modalVisible: true});
      console.log(seq_sig);
      const _index = this.state.doctorList.findIndex(
        i => i.seq_sig === seq_sig,
      );
      if (_index > -1) {
        const StellarSecret = await Keychain.getGenericPassword(
          'StellarSecret',
        );
        const info = JSON.parse(
          (
            await getInfoByKeyWithoutEncrypt(
              store.getState().authReducer.stellarPublicKey,
              seq_sig,
            )
          )
            .values()
            .next().value,
        );
        const sig = JSON.stringify({
          Signature: info.Signature,
          Status: !info.Status,
        });
        const subResult = await submitByKeyWithoutEncrypt(
          store.getState().authReducer.stellarPublicKey,
          StellarSecret.password,
          sig,
          seq_sig,
        );
        if (subResult && info) {
          this.state.doctorList[_index].status = !info.Status ? 1 : 0;
          await store.dispatch(updateDoctor(this.state.doctorList));
          this.setState({
            doctorList: store.getState().doctorReducer.DoctorList,
          });
        }
      }
      this.setState({modalVisible: false});
    } catch (err) {
      this.setState({modalVisible: false});
      console.log(err);
    }
  }
  async rejectRow(seq_sig) {
    try {
      this.setState({modalVisible: true});
      console.log(seq_sig);
      const seq_sig_index = this.state.doctorList.findIndex(
        i => i.seq_sig === seq_sig,
      );
      if (seq_sig_index > -1) {
        const StellarSecret = await Keychain.getGenericPassword(
          'StellarSecret',
        );
        const sig_clear = await clearInfo(
          store.getState().authReducer.stellarPublicKey,
          StellarSecret.password,
          seq_sig,
        );

        if (sig_clear) {
          this.state.doctorList.splice(seq_sig_index, 1);
          await store.dispatch(updateDoctor(this.state.doctorList));
          this.setState({
            doctorList: store.getState().doctorReducer.DoctorList,
          });
        }
      }
      this.setState({modalVisible: false});
    } catch (err) {
      this.setState({
        modalVisible: false,
      });
      console.log(err);
    }
  }
  actionOnRow = item => {
    Alert.alert(
      item.name,
      'Added : ' +
        item.date.split('G')[0] +
        '\nStatus : ' +
        (item.status ? 'Enable' : 'Disable'),
      [
        {text: 'Close', style: 'cancel'},
        {
          text: 'Remove',
          onPress: () => this.rejectRow(item.seq_sig),
        },
        {
          text: item.status ? 'Disable' : 'Enable',
          onPress: () => this.disableRow(item.seq_sig),
        },
      ],
      {
        cancelable: true,
      },
    );
  };
  renderItem = ({item}) =>
    item.status ? (
      <TouchableOpacity onPress={() => this.actionOnRow(item)}>
        <ListItem
          title={item.name}
          subtitle={item.date.split('G')[0]}
          leftAvatar={{
            source: item.avatar_url && {uri: item.avatar_url},
            title: item.name[0],
          }}
          bottomDivider
          chevron
        />
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => this.actionOnRow(item)}>
        <ListItem
          title={item.name}
          subtitle="Disable"
          leftAvatar={{
            source: item.avatar_url && {uri: item.avatar_url},
            title: item.name[0],
          }}
          bottomDivider
          chevron
        />
      </TouchableOpacity>
    );
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
          <Text
            style={{
              fontSize: 24,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 100,
            }}>
            submitting...
          </Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </Modal>
        <FlatList
          keyExtractor={(item, index) => index.toString()}
          data={this.state.doctorList}
          renderItem={this.renderItem}
        />
      </>
    );
  }
}
