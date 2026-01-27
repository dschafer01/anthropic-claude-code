// Home Stack Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';

import HomeScreen from '../screens/HomeScreen';
import RoundDetailsScreen from '../screens/RoundDetailsScreen';

const Stack = createNativeStackNavigator();

const HomeStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.white,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="RoundDetails"
        component={RoundDetailsScreen}
        options={{ title: 'Round Details' }}
      />
    </Stack.Navigator>
  );
};

export default HomeStack;
