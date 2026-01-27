// Round Stack Navigator (New Round Flow)

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity, Text } from 'react-native';
import { colors } from '../constants/colors';

import RoundSetupScreen from '../screens/RoundSetupScreen';
import CourseSelectScreen from '../screens/CourseSelectScreen';
import BetSetupScreen from '../screens/BetSetupScreen';
import HandicapSetupScreen from '../screens/HandicapSetupScreen';
import LiveScorecardScreen from '../screens/LiveScorecardScreen';
import RoundSummaryScreen from '../screens/RoundSummaryScreen';
import AddCourseScreen from '../screens/AddCourseScreen';
import AddPlayerScreen from '../screens/AddPlayerScreen';

const Stack = createNativeStackNavigator();

const RoundStack = () => {
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
        gestureEnabled: false,
      }}
    >
      <Stack.Screen
        name="RoundSetup"
        component={RoundSetupScreen}
        options={({ navigation }) => ({
          title: 'New Round',
          headerLeft: () => (
            <TouchableOpacity onPress={() => navigation.getParent()?.navigate('Home')}>
              <Text style={{ fontSize: 16, color: colors.text }}>Back</Text>
            </TouchableOpacity>
          ),
          gestureEnabled: true,
        })}
      />
      <Stack.Screen
        name="CourseSelect"
        component={CourseSelectScreen}
        options={{ title: 'Select Course' }}
      />
      <Stack.Screen
        name="AddCourse"
        component={AddCourseScreen}
        options={{ title: 'Add Course' }}
      />
      <Stack.Screen
        name="AddPlayer"
        component={AddPlayerScreen}
        options={{ title: 'Add Player' }}
      />
      <Stack.Screen
        name="BetSetup"
        component={BetSetupScreen}
        options={{
          title: 'Set Up Bets',
          gestureEnabled: true,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="HandicapSetup"
        component={HandicapSetupScreen}
        options={{
          title: 'Handicap Setup',
          gestureEnabled: true,
          headerBackVisible: true,
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="LiveScorecard"
        component={LiveScorecardScreen}
        options={{
          title: 'Scorecard',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="RoundSummary"
        component={RoundSummaryScreen}
        options={{
          title: 'Round Summary',
          headerBackVisible: false,
          gestureEnabled: false,
        }}
      />
    </Stack.Navigator>
  );
};

export default RoundStack;
