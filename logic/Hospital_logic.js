import React from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import {ListItem} from 'react-native-elements';
import {store} from '../redux/store/store';
import {updateHospital} from '../redux/actions/hospitalAction';
import {
  getInfoByKeyWithoutEncrypt,
  submitByKeyWithoutEncrypt,
  clearInfo,
} from '../stellar';
import * as Keychain from 'react-native-keychain';

export default class Hospital_logic extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hospitalList: [], modalVisible: false};
  }
  componentDidMount() {
    this.setState({
      hospitalList: store.getState().hospitalReducer.HospitalList,
    });
  }

  async disableRow(seq_sig) {
    try {
      this.setState({modalVisible: true});
      console.log(seq_sig);
      const _index = this.state.hospitalList.findIndex(
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
          this.state.hospitalList[_index].status = !info.Status ? 1 : 0;
          await store.dispatch(updateHospital(this.state.hospitalList));
          this.setState({
            hospitalList: store.getState().hospitalReducer.HospitalList,
          });
        }
      }
      this.setState({modalVisible: false});
    } catch (err) {
      this.setState({modalVisible: false});
      console.log(err);
    }
  }

  async rejectRow(seq_sig, seq_end) {
    try {
      this.setState({modalVisible: true});
      console.log(seq_sig);
      console.log(seq_end);
      const seq_sig_index = this.state.hospitalList.findIndex(
        i => i.seq_sig === seq_sig,
      );
      const seq_end_index = this.state.hospitalList.findIndex(
        i => i.seq_end === seq_end,
      );
      if (seq_sig_index > -1 && seq_end_index > -1) {
        const StellarSecret = await Keychain.getGenericPassword(
          'StellarSecret',
        );
        const sig_clear = await clearInfo(
          store.getState().authReducer.stellarPublicKey,
          StellarSecret.password,
          seq_sig,
        );
        const end_clear = await clearInfo(
          store.getState().authReducer.stellarPublicKey,
          StellarSecret.password,
          seq_end,
        );
        if (sig_clear && end_clear) {
          this.state.hospitalList.splice(seq_sig_index, 1);
          await store.dispatch(updateHospital(this.state.hospitalList));
          this.setState({
            hospitalList: store.getState().hospitalReducer.HospitalList,
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
          onPress: () => this.rejectRow(item.seq_sig, item.seq_end),
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
          data={this.state.hospitalList}
          renderItem={this.renderItem}
        />
      </>
    );
  }
}
