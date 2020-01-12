import React from 'react';
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider} from 'react-redux';
import {View, Button} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {createStackNavigator} from 'react-navigation-stack';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';

import Settings from './screens/Settings';
import Doctor from './screens/Doctor';
import Counter from './screens/Counter';
import Hospital from './screens/Hospital';

import AuthLoadingScreen from './screens/AuthLoadingScreen';
import {store, persistor} from './redux/store/store';

class SignInScreen extends React.Component {
  static navigationOptions = {
    title: 'Please sign in',
  };

  render() {
    return (
      <View>
        <Button title="Sign in!" onPress={this._signInAsync} />
      </View>
    );
  }

  _signInAsync = async () => {
    await AsyncStorage.setItem('userToken', 'abc');
    this.props.navigation.navigate('App');
  };
}

const AppTab = createMaterialBottomTabNavigator(
  {
    Information: {screen: Counter},
    Doctor: {screen: Doctor},
    Hospital: {screen: Hospital},
    Settings: {screen: Settings, params:{a:'aa'}},
  },
  {
    initialRouteName: 'Information',
    activeColor: '#f0edf6',
    inactiveColor: '#3e2465',
    barStyle: {backgroundColor: '#694fad'},
  },
);
const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppTab,
      Auth: SignInScreen,
    },
    {
      initialRouteName: 'AuthLoading',
    },
  ),
);
// React Native: App
export default App = () => {
  return (
    // Redux: Global Store
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  );
};
