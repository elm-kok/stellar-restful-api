import React from 'react';
import {Text, View, TouchableOpacity} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import {store} from '../redux/store/store';

class Hospital extends React.Component {
  constructor(props) {
    super(props);
  }
  onPress = () => {
    this.props.navigation.navigate('HospitalQR');
  };
  render() {
    return (
      <>
        <Text style={{fontSize: 50, color: '#FF9A4C', textAlign: 'center'}}>
          Where is your medical record.
        </Text>
        <Text>{store.getState().hospitalReducer.HospitalList}</Text>
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
export default Hospital;
