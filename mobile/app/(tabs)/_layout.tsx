import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Named icon components with displayName
const MapIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="map" size={size} color={color} />
);
MapIcon.displayName = 'MapIcon';

const FriendsIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="people" size={size} color={color} />
);
FriendsIcon.displayName = 'FriendsIcon';

const ProfileIcon = ({ color, size }: { color: string; size: number }) => (
  <Ionicons name="person" size={size} color={color} />
);
ProfileIcon.displayName = 'ProfileIcon';

function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#6366f1',
        tabBarInactiveTintColor: '#9ca3af',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: MapIcon,
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: 'Friends',
          tabBarIcon: FriendsIcon,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tabs>
  );
}

TabLayout.displayName = 'TabLayout';

export default TabLayout;
