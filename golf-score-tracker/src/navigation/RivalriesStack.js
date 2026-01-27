// Rivalries Stack Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';

import RivalriesScreen from '../screens/RivalriesScreen';
import HeadToHeadScreen from '../screens/HeadToHeadScreen';

const Stack = createNativeStackNavigator();

const RivalriesStack = () => {
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
        name="RivalriesList"
        component={RivalriesScreen}
        options={{ title: 'Rivalries' }}
      />
      <Stack.Screen
        name="HeadToHead"
        component={HeadToHeadScreen}
        options={{ title: 'Head to Head' }}
      />
    </Stack.Navigator>
  );
};

export default RivalriesStack;
