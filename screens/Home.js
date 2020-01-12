import React from 'react';
import Icon from 'react-native-vector-icons/Ionicons';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {NavigationContainer} from '@react-navigation/native';
import Counter from './Counter';
import Doctor from './Doctor';
import Hospital from './Hospital';
import Settings from './Settings';
const Tab = createBottomTabNavigator();

// React Native: App
export default Home = () => {
  return (
    <NavigationContainer>
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
    </NavigationContainer>
  );
};
