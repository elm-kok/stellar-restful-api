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
import Swiper from 'react-native-swiper';
import Patient from '../logic/Patient';
import Doctor_logic from '../logic/Doctor_logic';
import {store} from '../redux/store/store';
import {connect} from 'react-redux';

class Doctor extends React.Component {
  constructor(props) {
    super(props);
  }

  onPressDoctor = () => {
    this.props.navigation.navigate('DoctorQR');
  };
  onPressPatient = () => {
    this.props.navigation.navigate('PatientScan');
  };
  componentDidMount = async () => {
    this.setState({mode: await store.getState().authReducer.mode});
  };
  render() {
    return (
      <>
        <Swiper
          style={styles.wrapper}
          index={store.getState().authReducer.mode === 'Patinet' ? 0 : 1}
          showsButtons={false}
          key={store.getState().authReducer.mode.length}>
          <View style={styles.slide1}>
            <Text
              style={{
                fontSize: 30,
                color: '#FF9A4C',
                textAlign: 'right',
                padding: 15,
              }}>
              Doctor Management
            </Text>
            <Doctor_logic />
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
              onPress={this.onPressDoctor}
              accessibilityLabel="add_Doctor">
              <Icon name="plus" size={30} color="#01a699" />
            </TouchableOpacity>
          </View>
          {store.getState().authReducer.mode === 'Patient' ? (
            <View style={styles.slide2}>
              <Text
                style={{
                  fontSize: 30,
                  color: '#FF9A4C',
                  textAlign: 'right',
                  padding: 15,
                }}
                accessibilityLabel="header_Patient">
                Patient Management
              </Text>
              <Patient navigation={this.props.navigation} />
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
                onPress={this.onPressPatient}
                accessibilityLabel="add_Patient">
                <Icon name="plus" size={30} color="#01a699" />
              </TouchableOpacity>
            </View>
          ) : null}
        </Swiper>
      </>
    );
  }
}
const styles = StyleSheet.create({
  slide1: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  slide2: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
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
const mapStateToProps = state => {
  return {
    mode: state.authReducer.mode,
  };
};
export default connect(mapStateToProps)(Doctor);
