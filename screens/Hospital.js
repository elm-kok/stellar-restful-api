import React from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  TouchableHighlight,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {store} from '../redux/store/store';
import {SwipeListView, SwipeRow} from 'react-native-swipe-list-view';
import {updateHospital} from '../redux/actions/hospitalAction';
import {submit} from '../stellar';
import * as Keychain from 'react-native-keychain';
class Hospital extends React.Component {
  constructor(props) {
    super(props);
    this.state = {hospitalList: []};
  }
  componentDidMount() {
    this.setState({
      hospitalList: store.getState().hospitalReducer.HospitalList,
    });
  }
  onPress = () => {
    this.props.navigation.navigate('HospitalQR');
  };
  async rejectRow(seq) {
    const _index = this.state.hospitalList.findIndex(i => i.seq === seq);
    if (_index > -1) {
      this.state.hospitalList.splice(_index, 1);
    }
    await store.dispatch(updateHospital(this.state.hospitalList));
    this.setState({
      hospitalList: store.getState().hospitalReducer.HospitalList,
    });
  }

  render() {
    return (
      <>
        <Text style={{fontSize: 50, color: '#FF9A4C', textAlign: 'center'}}>
          Where is your medical record.
        </Text>
        <SwipeListView
          data={this.state.hospitalList}
          renderItem={data => (
            <SwipeRow rightOpenValue={-150}>
              <View style={styles.rowBack}>
                <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnLeft]}
                  onPress={() => this.disableRow(data.item.seq)}>
                  <Text style={styles.backTextWhite}>Disable</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.backRightBtn, styles.backRightBtnRight]}
                  onPress={() => this.rejectRow(data.item.seq)}>
                  <Text style={styles.backTextWhite}>Reject</Text>
                </TouchableOpacity>
              </View>
              <TouchableHighlight
                onPress={() => console.log('You touched me')}
                style={styles.rowFront}
                underlayColor={'#AAA'}>
                <View>
                  <Text>{data.item.name}</Text>
                </View>
              </TouchableHighlight>
            </SwipeRow>
          )}
          keyExtractor={item => item.seq}
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
export default Hospital;
