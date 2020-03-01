import React from 'react';
import {StyleSheet, Text, View, processColor} from 'react-native';
import equal from 'fast-deep-equal'
import {BarChart} from 'react-native-charts-wrapper';

class BarChartScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      legend: {
        enabled: true,
        textSize: 18,
        form: 'SQUARE',
        formSize: 18,
        xEntrySpace: 10,
        yEntrySpace: 5,
        formToTextSpace: 5,
        wordWrapEnabled: true,
        maxSizePercent: 0.5,
      },
      highlights: [{x: 3}, {x: 6}],
    };
  }
  componentDidUpdate(prevProps) {
    if (!equal(this.props.xAxisVal, prevProps.xAxisVal)) {
       this.setState({
        xAxis: {
          valueFormatter: this.props.xAxisVal,
          granularityEnabled: true,
          granularity: 1,
          textSize: 14,
        },
        data: {
          dataSets: [
            {
              values: this.props.yAxisVal,
              label: this.props.LabId,
              config: {
                color: processColor('teal'),
                barShadowColor: processColor('lightgrey'),
                highlightAlpha: 90,
                highlightColor: processColor('red'),
                valueTextSize: 18,
                drawValues: true,
                drawCircles: true,
                valueFormatter: '#.##',
              },
            },
          ],

          config: {
            barWidth: 0.7,
          },
        },
        maxX: this.props.xAxisVal.length,
      });
    }
  }
  componentDidMount() {
    this.setState({
      xAxis: {
        valueFormatter: this.props.xAxisVal,
        granularityEnabled: true,
        granularity: 1,
        textSize: 14,
      },
      data: {
        dataSets: [
          {
            values: this.props.yAxisVal,
            label: this.props.LabId,
            config: {
              color: processColor('teal'),
              barShadowColor: processColor('lightgrey'),
              highlightAlpha: 90,
              highlightColor: processColor('red'),
              valueTextSize: 18,
              drawValues: true,
              drawCircles: true,
              valueFormatter: '#.##',
            },
          },
        ],

        config: {
          barWidth: 0.7,
        },
      },
      maxX: this.props.xAxisVal.length,
    });
  }

  handleSelect(event) {
    let entry = event.nativeEvent;
    if (entry == null || entry.y == null) {
      this.setState({...this.state, selectedEntry: null});
    } else {
      this.setState({
        ...this.state,
        selectedEntry:
          'Date: ' +
          this.state.xAxis.valueFormatter[entry.x] +
          ' Value: ' +
          entry.y.toFixed(2),
      });
    }

    console.log(event.nativeEvent);
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <Text style={{paddingTop: 20, fontSize: 28, fontStyle: 'italic'}}>
          {this.props.Label}
        </Text>
        <Text style={{paddingTop: 10, paddingBottom: 15, fontSize: 20}}>
          {this.state.selectedEntry}
        </Text>

        {this.state.data && this.state.xAxis ? (
          <View style={styles.container}>
            <BarChart
              style={styles.chart}
              data={this.state.data}
              xAxis={this.state.xAxis}
              animation={{durationX: 2000}}
              legend={this.state.legend}
              gridBackgroundColor={processColor('#ffffff')}
              visibleRange={{x: {min: 1, max: this.state.maxX}}}
              drawBarShadow={false}
              drawValueAboveBar={true}
              drawHighlightArrow={true}
              onSelect={this.handleSelect.bind(this)}
              highlights={this.state.highlights}
              chartDescription={{text: ''}}
            />
          </View>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  chart: {
    flex: 1,
  },
});

export default BarChartScreen;
