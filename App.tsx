import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import RatingScreen from './src/screens/RatingScreen';
import RewardsScreen from './src/screens/RewardsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs({ route }: any) {
  const { user } = route.params;
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#2D7A3A',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E5EA' },
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        initialParams={{ user }}
        options={{ 
          tabBarLabel: 'Verkosten', 
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🍽️</Text> 
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        initialParams={{ user }}
        options={{ 
          tabBarLabel: 'Belohnungen', 
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🎁</Text> 
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name="Rating" component={RatingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
