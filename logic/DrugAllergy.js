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

export default class DrugAllergy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  actionOnRow = item => {
    Alert.alert(
      item.DATERECORD.split('T')[0],
      'Drug Name: ' +
        item.DNAME +
        '\nAllergy Type: ' +
        item.TYPEDX +
        '\nInformation: ' +
        item.INFORMANT +
        '\nAllergy Level: ' +
        item.ALEVEL,
      [{text: 'Close'}],
      {cancelable: true},
    );
  };
  renderItem = ({item}) => (
    <TouchableOpacity
      onPress={() => this.actionOnRow(item)}
      accessibilityLabel={item.DNAME}>
      <ListItem
        title={item.DNAME}
        subtitle={item.DATERECORD.split('T')[0]}
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
