import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './src/components/LoadingScreen';
import NameInputScreen from './src/screens/NameInputScreen';
import HomeScreen from './src/screens/HomeScreen';
import RatingScreen from './src/screens/RatingScreen';
import RewardsScreen from './src/screens/RewardsScreen';
import DeveloperScreen from './src/screens/DeveloperScreen';
import AdminScreen from './src/screens/AdminScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
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
        options={{ 
          tabBarLabel: 'Verkosten', 
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🍽️</Text> 
        }}
      />
      <Tab.Screen 
        name="Rewards" 
        component={RewardsScreen}
        options={{ 
          tabBarLabel: 'Belohnungen', 
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🎁</Text> 
        }}
      />
      <Tab.Screen
        name="Developer"
        component={DeveloperScreen}
        options={{
          tabBarLabel: 'Developer',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🛠️</Text>
        }}
      />
      <Tab.Screen
        name="Admin"
        component={AdminScreen}
        options={{
          tabBarLabel: 'Admin',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size ?? 20} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [initialRoute, setInitialRoute] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const name = await AsyncStorage.getItem('userName');
        setInitialRoute(name ? 'MainTabs' : 'NameInput');
      } catch (e) {
        console.error('Bootstrap error:', e);
        setInitialRoute('NameInput');
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []);

  return (
    <NavigationContainer>
      {isLoading ? (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Loading" component={LoadingScreen} />
        </Stack.Navigator>
      ) : (
        <Stack.Navigator 
          initialRouteName={initialRoute || 'NameInput'}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="NameInput" component={NameInputScreen} />
          <Stack.Screen name="MainTabs" component={MainTabs} />
          <Stack.Screen name="Rating" component={RatingScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}
