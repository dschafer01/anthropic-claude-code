// History Stack Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';

import HistoryScreen from '../screens/HistoryScreen';
import RoundDetailsScreen from '../screens/RoundDetailsScreen';

const Stack = createNativeStackNavigator();

const HistoryStack = () => {
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
        name="HistoryList"
        component={HistoryScreen}
        options={{ title: 'Round History' }}
      />
      <Stack.Screen
        name="RoundDetails"
        component={RoundDetailsScreen}
        options={{ title: 'Round Details' }}
      />
    </Stack.Navigator>
  );
};

export default HistoryStack;
