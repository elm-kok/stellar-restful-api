// Imports: Dependencies
import React from 'react';
import {PersistGate} from 'redux-persist/es/integration/react';
import {Provider} from 'react-redux';
import Icon from 'react-native-vector-icons/Ionicons';
// Imports: Screens
import {NavigationNativeContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Counter from './screens/Counter';
import Doctor from './screens/Doctor';
import Hospital from './screens/Hospital';
import Settings from './screens/Settings';
// Imports: Redux Persist Persister
import {store, persistor} from './redux/store/store';
const Tab = createBottomTabNavigator();

// React Native: App
export default App = () => {
  return (
    // Redux: Global Store
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationNativeContainer>
          <Tab.Navigator
            screenOptions={({route}) => ({
              tabBarIcon: ({focused, color, size}) => {
                let iconName;
                if (route.name === 'Information') {
                  iconName = focused
                    ? 'ios-information-circle'
                    : 'ios-information-circle-outline';
                } else if (route.name === 'Doctor') {
                  iconName = focused ? 'ios-people' : 'ios-people';
                } else if (route.name === 'Hospital') {
                  iconName = focused ? 'ios-filing' : 'ios-filing';
                } else if (route.name === 'Settings') {
                  iconName = focused ? 'ios-settings' : 'ios-settings';
                }
                // You can return any component that you like here!
                return <Icon name={iconName} size={size} color={color} />;
              },
            })}
            tabBarOptions={{
              activeTintColor: 'tomato',
              inactiveTintColor: 'gray',
            }}>
            <Tab.Screen name="Information" component={Counter} />
            <Tab.Screen name="Doctor" component={Doctor} />
            <Tab.Screen name="Hospital" component={Hospital} />
            <Tab.Screen name="Settings" component={Settings} />
          </Tab.Navigator>
        </NavigationNativeContainer>
      </PersistGate>
    </Provider>
  );
};
