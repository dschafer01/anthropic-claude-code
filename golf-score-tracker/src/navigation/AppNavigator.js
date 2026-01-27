// Main App Navigator with bottom tabs

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../constants/colors';

import HomeStack from './HomeStack';
import RoundStack from './RoundStack';
import RivalriesStack from './RivalriesStack';
import HistoryStack from './HistoryStack';
import ProfileStack from './ProfileStack';

const Tab = createBottomTabNavigator();

// Tab bar icons
const TabIcon = ({ name, focused, color }) => {
  const icons = {
    Home: 'H',
    NewRound: '+',
    Rivalries: 'R',
    History: 'C',
    Profile: 'P',
  };

  return (
    <View style={styles.iconContainer}>
      <Text
        style={[
          styles.icon,
          {
            color: focused ? colors.primary : colors.textMuted,
            fontWeight: focused ? '800' : '600',
          },
        ]}
      >
        {icons[name]}
      </Text>
    </View>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color }) => (
            <TabIcon name={route.name} focused={focused} color={color} />
          ),
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStack}
          options={{ tabBarLabel: 'Home' }}
        />
        <Tab.Screen
          name="NewRound"
          component={RoundStack}
          options={{
            tabBarLabel: 'New Round',
            tabBarStyle: { display: 'none' },
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Prevent default action
              e.preventDefault();
              // Navigate to new round setup
              navigation.navigate('NewRound', { screen: 'RoundSetup' });
            },
          })}
        />
        <Tab.Screen
          name="Rivalries"
          component={RivalriesStack}
          options={{ tabBarLabel: 'Rivalries' }}
        />
        <Tab.Screen
          name="History"
          component={HistoryStack}
          options={{ tabBarLabel: 'History' }}
        />
        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{ tabBarLabel: 'Profile' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.white,
    borderTopColor: colors.cardBorder,
    borderTopWidth: 1,
    height: 85,
    paddingTop: 8,
    paddingBottom: 25,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 24,
  },
});

export default AppNavigator;
