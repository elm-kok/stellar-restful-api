import React, {Component} from 'react';
import {
  Text,
  ScrollView,
  Button,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {fetchByPatient} from '../logic/fetch';
import BarChartScreen from '../logic/BarChart';
import Swiper from 'react-native-swiper';

/*
DRUG_OPD
DRUGALLERGY
LAB
*/
var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9',
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#F5FCFF',
  },
  chart: {
    flex: 1,
  },
  chartContainer: {
    flex: 1,
    height: height / 1.5,
    width: width,
  },
});

export default class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      DRUG_OPD: null,
      DRUGALLERGY: null,
      LAB: null,
      loaded: false,
    };
  }
  _onLoad = async () => {
    try {
      const result = await fetchByPatient();
      this.setState({
        LAB: result.LAB,
        DRUG_OPD: result.DRUG_OPD,
        DRUGALLERGY: result.DRUGALLERGY,
        loaded: true,
      });
    } catch (e) {
      console.log(e);
    }
  };

  render() {
    return (
      <Swiper style={styles.wrapper} showsButtons={true}>
        <View style={styles.slide1}>
          <ScrollView style={{flex: 1}}>
            <Text style={styles.text}>Lab Testing</Text>
            <View style={styles.chartContainer}>
              <BarChartScreen />
            </View>
          </ScrollView>
        </View>
        <View style={styles.slide2}>
          <ScrollView style={{flex: 1}}>
            <Text style={styles.text}>Drug Allergy</Text>
          </ScrollView>
        </View>
        <View style={styles.slide3}>
          <ScrollView style={{flex: 1}}>
            <Text style={styles.text}>Drug Dispensing</Text>
          </ScrollView>
        </View>
      </Swiper>
    );
  }
}
