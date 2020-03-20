import React from 'react';
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider} from 'react-redux';
import {createSwitchNavigator, createAppContainer} from 'react-navigation';
import {createMaterialBottomTabNavigator} from 'react-navigation-material-bottom-tabs';
import {store, persistor} from './redux/store/store';

import Settings from './screens/Settings';
import Doctor from './screens/Doctor';
import Info from './screens/Info';
import Hospital from './screens/Hospital';
import SignInScreen from './screens/SignInScreen';
import AuthLoadingScreen from './screens/AuthLoadingScreen';
import HospitalQR from './screens/HospitalQR';
import HospitalScan from './screens/HospitalScan';
import DoctorQR from './screens/DoctorQR';
import DoctorScan from './screens/DoctorScan';
import PatientQR from './screens/PatientQR';
import PatientScan from './screens/PatientScan';
import PatientInfo from './screens/PatientInfo';
import Patient from './logic/Patient';

import Icon from 'react-native-vector-icons/Ionicons';

const AppTab = createMaterialBottomTabNavigator(
  {
    Information: {
      screen: Info,
      navigationOptions: {
        tabBarLabel: 'Info',
        tabBarIcon: ({tintColor}) => (
          <Icon style={[{color: tintColor}]} size={25} name={'ios-body'} />
        ),
      },
    },
    Doctor: {
      screen: Doctor,
      navigationOptions: {
        tabBarLabel: 'Doctor',
        tabBarIcon: ({tintColor}) => (
          <Icon style={[{color: tintColor}]} size={25} name={'ios-people'} />
        ),
      },
    },
    Hospital: {
      screen: Hospital,
      navigationOptions: {
        tabBarLabel: 'Hospital',
        tabBarIcon: ({tintColor}) => (
          <Icon style={[{color: tintColor}]} size={25} name={'ios-medkit'} />
        ),
      },
    },
    Settings: {
      screen: Settings,
      navigationOptions: {
        tabBarLabel: 'Settings',
        tabBarIcon: ({tintColor}) => (
          <Icon style={[{color: tintColor}]} size={25} name={'ios-settings'} />
        ),
      },
    },
  },
  {
    initialRouteName: 'Information',
    activeColor: '#fffdf9',
    inactiveColor: '#beebe9',
    barStyle: {backgroundColor: '#8ac6d1'},
  },
);

const AppContainer = createAppContainer(
  createSwitchNavigator(
    {
      AuthLoading: AuthLoadingScreen,
      App: AppTab,
      Auth: SignInScreen,
      HospitalScan: HospitalScan,
      HospitalQR: HospitalQR,
      DoctorScan: DoctorScan,
      DoctorQR: DoctorQR,
      PatientScan: PatientScan,
      PatientQR: PatientQR,
      PatientInfo: PatientInfo,
      Patient: Patient,
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
