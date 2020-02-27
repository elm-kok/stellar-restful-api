import React from 'react';
import {
  Text,
  ScrollView,
  Button,
  SafeAreaView,
  View,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {fetchByPatient} from '../logic/fetch';
import BarChartScreen from '../logic/BarChart';
/*
DRUG_OPD
DRUGALLERGY
LAB
*/
class Info extends React.Component {
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
      <ScrollView style={{flex: 1}}>
        <Button title="Banana" onPress={this._onLoad} />
        {this.state.loaded ? (
          <>
            <Text>LAB</Text>
            <View style={styles.chartContainer}>
              <BarChartScreen />
            </View>
            
          </>
        ) : (
          <>
            <Text>On Loading...</Text>
          </>
        )}
      </ScrollView>
    );
  }
}
var {height, width} = Dimensions.get('window');
const styles = StyleSheet.create({
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
export default Info;
