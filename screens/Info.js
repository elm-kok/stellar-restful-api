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
    backgroundColor: '#ffffff',
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  text: {
    color: '#b32',
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
    padding: 20,
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
      this.labGroup();
    } catch (e) {
      console.log(e);
    }
  };

  labGroup() {
    var i;
    var dataGraph = {};
    var labId;
    for (i = 0; i < this.state.LAB.length; ++i) {
      labId = this.state.LAB[i].LABID;
      if (labId) {
        if (dataGraph[labId] !== undefined) {
          dataGraph[labId].push(this.state.LAB[i]);
        } else {
          dataGraph[labId] = [this.state.LAB[i]];
        }
      }
    }
    for (const [key, value] of Object.entries(dataGraph)) {
      var val = value;
      val.sort(function(a, b) {
        return new Date(b.DATE_SERV) - new Date(a.DATE_SERV);
      });
      dataGraph[key] = val;
    }
    var xAxisVal = {};
    var yAxisVal = {};
    for (const [key, value] of Object.entries(dataGraph)) {
      xAxisVal[key] = [];
      yAxisVal[key] = [];
      for (i = 0; i < value.length; ++i) {
        xAxisVal[key].push(value[i].DATE_SERV.split('T')[0]);
        yAxisVal[key].push({y: value[i].LABRESULT});
      }
    }

    var rows = [];
    for (const [key, value] of Object.entries(dataGraph)) {
      rows.push(
        <View style={styles.chartContainer} key={key}>
          <BarChartScreen
            xAxisVal={xAxisVal[key]}
            yAxisVal={yAxisVal[key]}
            Label={dataGraph[key][0]['LABTEST']}
            LabId={'LAB ID: ' + dataGraph[key][0]['LABID']}
          />
        </View>,
      );
    }

    this.setState({bars: rows});
    return null;
  }
  render() {
    return (
      <>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <View style={styles.slide1}>
            <ScrollView style={{flex: 1}}>
              <Text style={styles.text}>Lab Testing</Text>
              {this.state.bars ? this.state.bars : null}
            </ScrollView>
          </View>
          <View style={styles.slide2}>
            <ScrollView style={{flex: 1}}>
              <Text style={styles.text}>Drug Allergy</Text>
              {this.state.DRUGALLERGY ? (
                <Text>{JSON.stringify(this.state.DRUGALLERGY[0])}</Text>
              ) : null}
            </ScrollView>
          </View>
          <View style={styles.slide3}>
            <ScrollView style={{flex: 1}}>
              <Text style={styles.text}>Drug Dispensing</Text>
              {this.state.DRUG_OPD ? (
                <Text>{JSON.stringify(this.state.DRUG_OPD[0])}</Text>
              ) : null}
            </ScrollView>
          </View>
        </Swiper>
        <Button onPress={() => this._onLoad()} title="Fetch Record"></Button>
      </>
    );
  }
}
