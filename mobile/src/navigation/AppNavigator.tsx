import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MapPin, List, User } from 'lucide-react-native';
import { useAuthStore } from '../store/authStore';
import { colors } from '../constants/theme';

// Import screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { MapScreen } from '../screens/map/MapScreen';
import { SpotDetailScreen } from '../screens/map/SpotDetailScreen';
import { ListScreen } from '../screens/list/ListScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const RootStack = createNativeStackNavigator();
const MapStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Map stack with nested screens
function MapNavigator() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="MapView" component={MapScreen} />
      <MapStack.Screen name="SpotDetail" component={SpotDetailScreen} />
    </MapStack.Navigator>
  );
}

// Main tabs navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary[500],
        tabBarInactiveTintColor: colors.gray[600],
        headerShown: false,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: colors.light[200],
          backgroundColor: colors.white,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MapPin color={color} size={size} />,
          tabBarLabel: 'Map',
        }}
      />
      <Tab.Screen
        name="List"
        component={ListScreen}
        options={{
          tabBarIcon: ({ color, size }) => <List color={color} size={size} />,
          tabBarLabel: 'List',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

// Root navigator
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Don't render navigation until we've checked auth status
  if (isLoading) {
    return null;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="MainTabs" component={MainTabs} />
        ) : (
          <>
            <RootStack.Screen name="Login" component={LoginScreen} />
            <RootStack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
