import React from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {ListItem} from 'react-native-elements';
import {store} from '../redux/store/store';
import {updatePatient} from '../redux/actions/patientAction';

export default class Patient extends React.Component {
  constructor(props) {
    super(props);
    this.state = {patientList: []};
  }
  componentDidMount() {
    this.setState({
      patientList: store.getState().patientReducer.PatientList,
    });
  }
  async rejectRow(spk) {
    try {
      this.setState({modalVisible: true});
      console.log(spk);
      const spk_index = this.state.patientList.findIndex(i => i.spk === spk);
      if (spk_index > -1) {
        this.state.patientList.splice(spk_index, 1);
        await store.dispatch(updatePatient(this.state.patientList));
        this.setState({
          patientList: store.getState().patientReducer.PatientList,
        });
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
      'Remove : ' + item.name + '?',
      'Added : ' + item.date.split('G')[0],
      [
        {
          text: 'Remove',
          onPress: () => this.rejectRow(item.spk),
        },
        {text: 'Close', style: 'cancel'},
      ],
      {
        cancelable: true,
      },
    );
  };
  navigateInfo = item => {
    this.props.navigation.navigate('PatientInfo', {item: item});
  };
  renderItem = ({item}) => (
    <TouchableOpacity onPress={() => this.navigateInfo(item)}>
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
  );
  render() {
    return (
      <FlatList
        keyExtractor={(item, index) => index.toString()}
        data={this.state.patientList}
        renderItem={this.renderItem}
      />
    );
  }
}
