import React from 'react';
import {Alert, FlatList, StyleSheet, TouchableOpacity} from 'react-native';
import {ListItem} from 'react-native-elements';

export default class DrugOpd extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  actionOnRow = item => {
    var prov = item.PROV_PRENAME + item.PROV_NAME;
    if (prov) prov += ' ' + item.PROV_LNAME;
    Alert.alert(
      item.DATE_SERV.split('T')[0],
      'NAME: ' +
        item.DNAME +
        '\nCOMSUME: ' +
        item.COMSUME +
        '\nDRUG COMPANY: ' +
        item.DCOMP +
        '\nAMOUNT: ' +
        item.AMOUNT +
        ' ' +
        (item.DUNIT ? item.DUNIT : '') +
        '\nPACKING UNIT: ' +
        item.UNIT_PACKING +
        '\nPROVIDER: ' +
        (prov ? prov : null),
      [{text: 'Close'}],
      {cancelable: true},
    );
  };
  renderItem = ({item}) => (
    <TouchableOpacity onPress={() => this.actionOnRow(item)}>
      <ListItem
        title={item.DNAME}
        subtitle={
          item.DATE_SERV.split('T')[0] +
          (item.AMOUNT ? ' Amount: ' + item.AMOUNT : '') +
          (item.DUNIT ? ' '+item.DUNIT : '')
        }
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
