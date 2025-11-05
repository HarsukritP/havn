import { View, Text, SafeAreaView, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">Profile</Text>
      </View>

      <ScrollView className="flex-1">
        {/* Profile Card */}
        <View className="bg-white m-4 rounded-xl p-6 items-center">
          <View className="bg-indigo-100 rounded-full w-24 h-24 items-center justify-center mb-4">
            <Text className="text-4xl">👤</Text>
          </View>
          <Text className="text-2xl font-bold text-gray-900">Guest User</Text>
          <Text className="text-base text-gray-600 mt-1">Sign in to save your profile</Text>
          
          <TouchableOpacity className="bg-indigo-600 rounded-lg px-6 py-3 mt-4">
            <Text className="text-white font-semibold">Sign In</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Your Stats</Text>
          <View className="flex-row space-x-3">
            <View className="flex-1 bg-white rounded-lg p-4">
              <Text className="text-2xl font-bold text-indigo-600">0</Text>
              <Text className="text-sm text-gray-600 mt-1">Study Hours</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4">
              <Text className="text-2xl font-bold text-green-600">0</Text>
              <Text className="text-sm text-gray-600 mt-1">Check-ins</Text>
            </View>
            <View className="flex-1 bg-white rounded-lg p-4">
              <Text className="text-2xl font-bold text-purple-600">0</Text>
              <Text className="text-sm text-gray-600 mt-1">Friends</Text>
            </View>
          </View>
        </View>

        {/* Settings */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold text-gray-900 mb-3">Settings</Text>
          
          <TouchableOpacity className="bg-white rounded-lg p-4 mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="notifications-outline" size={24} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-900">Notifications</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-lg p-4 mb-2 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="location-outline" size={24} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-900">Location Privacy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="bg-white rounded-lg p-4 flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Ionicons name="information-circle-outline" size={24} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-900">About</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

