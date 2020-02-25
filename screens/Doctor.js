import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {store} from '../redux/store/store';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import {updateDoctor} from '../redux/actions/doctorAction';
import {
  getInfoByKeyWithoutEncrypt,
  submitByKeyWithoutEncrypt,
  clearInfo,
} from '../stellar';
import * as Keychain from 'react-native-keychain';
class Doctor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {doctorList: [], modalVisible: false};
  }
  componentDidMount() {
    this.setState({
      doctorList: store.getState().doctorReducer.DoctorList,
    });
  }
  onPress = () => {
    this.props.navigation.navigate('DoctorQR');
  };
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
        <Text style={{fontSize: 50, color: '#FF9A4C', textAlign: 'center'}}>
          Where is your Doctor.
        </Text>
        <SwipeListView
          data={this.state.doctorList}
          renderItem={data => (
            <SwipeRow rightOpenValue={-150}>
              <View style={styles.rowBack}>
                {data.item.status ? (
                  <TouchableOpacity
                    style={[styles.backRightBtn, styles.backRightBtnLeft]}
                    onPress={() => this.disableRow(data.item.seq_sig)}>
                    <Text style={styles.backTextWhite}>Disable</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={[styles.backRightBtn, styles.backRightBtnLeft]}
                    onPress={() => this.disableRow(data.item.seq_sig)}>
                    <Text style={styles.backTextWhite}>Enable</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => this.rejectRow(data.item.seq_sig)}>
                  <Text style={styles.backTextWhite}>Reject</Text>
                </TouchableOpacity>
              </View>
              <TouchableHighlight
                onPress={() => console.log('You touched me')}
                style={styles.rowFront}
                underlayColor={'#AAA'}>
                <View>
                  <Text>
                    {data.item.name} status: {data.item.status} Sig:{' '}
                    {data.item.seq_sig}
                  </Text>
                </View>
              </TouchableHighlight>
            </SwipeRow>
          )}
          keyExtractor={item => item.seq_sig}
        />
        <TouchableOpacity
          style={{
            borderWidth: 1,
            borderColor: 'rgba(0,0,0,0.2)',
            alignItems: 'center',
            justifyContent: 'center',
            width: 70,
            position: 'absolute',
            bottom: 10,
            right: 10,
            height: 70,
            backgroundColor: '#fff',
            borderRadius: 100,
          }}
          onPress={this.onPress}>
          <Icon name="plus" size={30} color="#01a699" />
        </TouchableOpacity>
      </>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  standalone: {
    marginTop: 30,
    marginBottom: 30,
  },
  standaloneRowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    justifyContent: 'center',
    height: 50,
  },
  standaloneRowBack: {
    alignItems: 'center',
    backgroundColor: '#8BC645',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  backTextWhite: {
    color: '#FFF',
  },
  rowFront: {
    alignItems: 'center',
    backgroundColor: '#CCC',
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    justifyContent: 'center',
    height: 50,
  },
  rowBack: {
    alignItems: 'center',
    backgroundColor: '#DDD',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: 15,
  },
  backRightBtn: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: 75,
  },
  backRightBtnLeft: {
    backgroundColor: 'blue',
    right: 75,
  },
  backRightBtnRight: {
    backgroundColor: 'red',
    right: 0,
  },
  controls: {
    alignItems: 'center',
    marginBottom: 30,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 5,
  },
  switch: {
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 10,
    width: Dimensions.get('window').width / 4,
  },
  trash: {
    height: 25,
    width: 25,
  },
});
export default Doctor;
