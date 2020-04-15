import React, {Component} from 'react';
import {
  Text,
  ScrollView,
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import {store} from '../redux/store/store';
import {SearchBar} from 'react-native-elements';
import {fetchByDoctor} from '../logic/fetch';
import BarChartScreen from '../logic/BarChart';
import Swiper from 'react-native-swiper';
import DrugAllergy from '../logic/DrugAllergy';
import DrugOpd from '../logic/DrugOpd';
import Icon from 'react-native-vector-icons/FontAwesome';
import {updatePatient} from '../redux/actions/patientAction';
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
    backgroundColor: '#e1e8ee',
  },
  slide2: {
    flex: 1,
    backgroundColor: '#e1e8ee',
  },
  slide3: {
    flex: 1,
    backgroundColor: '#e1e8ee',
  },
  text: {
    color: '#ffa45e',
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
      searchDA: '',
      searchDO: '',
      searchLAB: '',
      modalVisible: false,
      refreshing: false,
    };
  }
  setData = async () => {
    this.setState({refreshing: true});
    const spk = this.props.navigation.state.params.item.spk;
    const secret = this.props.navigation.state.params.item.secretKey;
    const seq = this.props.navigation.state.params.item.seq;

    try {
      const result = await fetchByDoctor(spk, secret, seq);
      this.setState({
        LAB: result.LAB,
        DRUG_OPD: result.DRUG_OPD,
        DRUGALLERGY: result.DRUGALLERGY,
        loaded: true,
      });
      this.labGroup();
      this.setState({refreshing: false});
    } catch (e) {
      this.setState({refreshing: false});
      console.log(e);
    }
  };
  componentDidMount = async () => {
    await this.setData();
  };
  async rejectRow(spk) {
    try {
      this.setState({modalVisible: true});
      let patientList = store.getState().patientReducer.PatientList;
      const spk_index = patientList.findIndex(i => i.spk === spk);
      if (spk_index > -1) {
        patientList.splice(spk_index, 1);
        await store.dispatch(updatePatient(patientList));
      }
      this.setState({modalVisible: false});
    } catch (err) {
      this.setState({
        modalVisible: false,
      });
      console.log(err);
    }
    this.props.navigation.navigate('Doctor');
  }
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
        <View
          style={styles.chartContainer}
          key={key}
          accessibilityLabel={'LabID_' + key}>
          <BarChartScreen
            xAxisVal={xAxisVal[key]}
            yAxisVal={yAxisVal[key]}
            Label={dataGraph[key][0]['LABTEST']}
            LabId={'LAB ID: ' + dataGraph[key][0]['LABID']}
          />
        </View>,
      );
    }
    this.state.DRUG_OPD.sort(function(a, b) {
      return new Date(b.DATE_SERV) - new Date(a.DATE_SERV);
    });
    this.state.DRUGALLERGY.sort(function(a, b) {
      return new Date(b.DATERECORD) - new Date(a.DATERECORD);
    });
    this.setState({
      bars: rows,
      bars_r: rows,
      dataGraph: dataGraph,
      DRUG_OPD_r: this.state.DRUG_OPD,
      DRUGALLERGY_r: this.state.DRUGALLERGY,
    });
    return null;
  }
  updateSearchDO = searchDO => {
    if (searchDO === '') {
      this.setState({searchDO: searchDO, DRUG_OPD_r: this.state.DRUG_OPD});
    } else {
      var i;
      var result = [];
      var s_str = searchDO.split(' ');
      var searchDOs = '^';
      for (const s in s_str) {
        searchDOs += '(?=.*' + s_str[s] + ')';
      }
      const re = new RegExp(searchDOs, 'i');
      for (i = 0; i < this.state.DRUG_OPD.length; ++i) {
        if (JSON.stringify(this.state.DRUG_OPD[i]).match(re)) {
          result.push(this.state.DRUG_OPD[i]);
        }
      }
      this.setState({searchDO: searchDO, DRUG_OPD_r: result});
    }
  };
  updateSearchDA = searchDA => {
    if (searchDA === '') {
      this.setState({
        searchDA: searchDA,
        DRUGALLERGY_r: this.state.DRUGALLERGY,
      });
    } else {
      var i;
      var result = [];
      var s_str = searchDA.split(' ');
      var searchDAs = '^';
      for (const s in s_str) {
        searchDAs += '(?=.*' + s_str[s] + ')';
      }
      const re = new RegExp(searchDAs, 'i');
      for (i = 0; i < this.state.DRUGALLERGY.length; ++i) {
        if (JSON.stringify(this.state.DRUGALLERGY[i]).match(re)) {
          result.push(this.state.DRUGALLERGY[i]);
        }
      }
      this.setState({searchDA: searchDA, DRUGALLERGY_r: result});
    }
  };

  updateSearchLAB = searchLAB => {
    if (searchLAB === '') {
      this.setState({
        searchLAB: searchLAB,
        bars_r: this.state.bars,
      });
    } else {
      var i;
      var s_str = searchLAB.split(' ');
      var searchLABs = '^';
      for (const s in s_str) {
        searchLABs += '(?=.*' + s_str[s] + ')';
      }
      const re = new RegExp(searchLABs, 'i');
      var rows = [];
      var xAxisVal = {};
      var yAxisVal = {};

      for (const [key, value] of Object.entries(this.state.dataGraph)) {
        xAxisVal[key] = [];
        yAxisVal[key] = [];
        for (i = 0; i < value.length; ++i) {
          if (JSON.stringify(value[i]).match(re)) {
            xAxisVal[key].push(value[i].DATE_SERV.split('T')[0]);
            yAxisVal[key].push({y: value[i].LABRESULT});
          }
        }
        if (!xAxisVal[key].length) {
          delete xAxisVal[key];
          delete yAxisVal[key];
        }
      }

      var rows = [];
      for (const [key, value] of Object.entries(xAxisVal)) {
        rows.push(
          <View style={styles.chartContainer} key={key}>
            <BarChartScreen
              xAxisVal={xAxisVal[key]}
              yAxisVal={yAxisVal[key]}
              Label={this.state.dataGraph[key][0]['LABTEST']}
              LabId={'LAB ID: ' + this.state.dataGraph[key][0]['LABID']}
            />
          </View>,
        );
      }
      this.setState({searchLAB: searchLAB, bars_r: rows});
    }
  };
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
            Removing...
          </Text>
          <ActivityIndicator size="large" color="#0000ff" />
        </Modal>
        <Swiper style={styles.wrapper} showsButtons={false}>
          <View style={styles.slide1}>
            <Text style={styles.text} accessibilityLabel="LabTesting_header">
              Lab Testing
            </Text>
            <SearchBar
              placeholder="Type Here..."
              onChangeText={this.updateSearchLAB}
              value={this.state.searchLAB}
              lightTheme={true}
            />
            <ScrollView
              style={{flex: 1}}
              refreshControl={
                <RefreshControl
                  refreshing={this.state.refreshing}
                  onRefresh={this.setData}
                />
              }>
              {this.state.bars_r ? this.state.bars_r : null}
            </ScrollView>
          </View>
          <View style={styles.slide2}>
            <SafeAreaView style={{flex: 1}}>
              <Text style={styles.text} accessibilityLabel="DrugAllergy_header">
                Drug Allergy
              </Text>
              <SearchBar
                placeholder="Type Here..."
                onChangeText={this.updateSearchDA}
                value={this.state.searchDA}
                lightTheme={true}
              />
              {this.state.DRUGALLERGY_r ? (
                <DrugAllergy data={this.state.DRUGALLERGY_r} />
              ) : null}
            </SafeAreaView>
          </View>
          <View style={styles.slide3}>
            <SafeAreaView style={{flex: 1}}>
              <Text
                style={styles.text}
                accessibilityLabel="DrugDispensing_header">
                Drug Dispensing
              </Text>
              <SearchBar
                placeholder="Type Here..."
                onChangeText={this.updateSearchDO}
                value={this.state.searchDO}
                lightTheme={true}
              />
              {this.state.DRUG_OPD_r ? (
                <DrugOpd data={this.state.DRUG_OPD_r} />
              ) : null}
            </SafeAreaView>
          </View>
        </Swiper>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            position: 'absolute',
            top: 1,
            right: 1,
            height: 30,
          }}
          onPress={() => this.props.navigation.navigate('Doctor')}
          accessibilityLabel="exit_PatientInfo">
          <Icon name="times" size={30} color="#01a699" />
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            alignItems: 'center',
            justifyContent: 'center',
            width: 30,
            position: 'absolute',
            top: 1,
            left: 1,
            height: 30,
          }}
          onPress={() =>
            this.rejectRow(this.props.navigation.state.params.item.spk)
          }
          accessibilityLabel="remove_PatientInfo">
          <Icon name="trash" size={30} color="#01a699" />
        </TouchableOpacity>
      </>
    );
  }
}
