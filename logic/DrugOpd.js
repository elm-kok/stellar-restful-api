import React from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {ListItem} from 'react-native-elements';

export default class DrugOpd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  actionOnRow = item => {
    Alert.alert(
      item.DATE_SERV.split('T')[0],
      'Drug Name: ' +
        item.DNAME +
        '\nCOMSUME: ' +
        item.COMSUME +
        '\nDrug Company: ' +
        item.DCOMP +
        '\nAMOUNT: ' +
        item.AMOUNT +
        '\nDUNIT: ' +
        item.DUNIT +
        '\nUNIT_PACKING: ' +
        item.UNIT_PACKING +
        '\nPROV_PRENAME: ' +
        item.PROV_PRENAME +
        '\nPROV_NAME: ' +
        item.PROV_NAME +
        ' ' +
        item.PROV_LNAME,
      [{text: 'Close'}],
      {cancelable: true},
    );
  };
  renderItem = ({item}) => (
    <TouchableOpacity onPress={() => this.actionOnRow(item)}>
      <ListItem
        title={item.DNAME + (item.AMOUNT ? ', Amount: ' + item.AMOUNT : '')}
        subtitle={item.DATE_SERV.split('T')[0]}
        leftAvatar={{
          source: item.avatar_url && {uri: item.avatar_url},
          title: item.DNAME[0],
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
        data={this.props.data}
        renderItem={this.renderItem}
      />
    );
  }
}
