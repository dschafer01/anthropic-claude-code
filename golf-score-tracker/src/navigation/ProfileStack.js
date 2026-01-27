// Profile Stack Navigator

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../constants/colors';

import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CourseManagementScreen from '../screens/CourseManagementScreen';
import AddCourseScreen from '../screens/AddCourseScreen';
import EditCourseScreen from '../screens/EditCourseScreen';
import GHINSetupScreen from '../screens/GHINSetupScreen';
import PlayerManagementScreen from '../screens/PlayerManagementScreen';
import AddPlayerScreen from '../screens/AddPlayerScreen';

const Stack = createNativeStackNavigator();

const ProfileStack = () => {
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
        name="ProfileMain"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <Stack.Screen
        name="CourseManagement"
        component={CourseManagementScreen}
        options={{ title: 'Manage Courses' }}
      />
      <Stack.Screen
        name="AddCourse"
        component={AddCourseScreen}
        options={{ title: 'Add Course' }}
      />
      <Stack.Screen
        name="EditCourse"
        component={EditCourseScreen}
        options={{ title: 'Edit Course' }}
      />
      <Stack.Screen
        name="GHINSetup"
        component={GHINSetupScreen}
        options={{ title: 'GHIN Setup' }}
      />
      <Stack.Screen
        name="PlayerManagement"
        component={PlayerManagementScreen}
        options={{ title: 'Manage Players' }}
      />
      <Stack.Screen
        name="AddPlayer"
        component={AddPlayerScreen}
        options={{ title: 'Add Player' }}
      />
    </Stack.Navigator>
  );
};

export default ProfileStack;
