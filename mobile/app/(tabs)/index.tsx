import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">havn</Text>
        <Text className="text-sm text-gray-600">Find study spots at UW Waterloo</Text>
      </View>

      {/* Main Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center">
          <Ionicons name="map-outline" size={80} color="#6366f1" />
          <Text className="text-2xl font-bold text-gray-900 mt-6">Map View</Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Interactive map with study spots will appear here
          </Text>
          
          {/* Quick Stats */}
          <View className="flex-row mt-8 space-x-4">
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <Text className="text-3xl font-bold text-indigo-600">15</Text>
              <Text className="text-sm text-gray-600 mt-1">Spots</Text>
            </View>
            <View className="bg-white rounded-lg p-4 shadow-sm items-center">
              <Text className="text-3xl font-bold text-green-600">8</Text>
              <Text className="text-sm text-gray-600 mt-1">Available</Text>
            </View>
          </View>

          {/* Coming Soon Badge */}
          <View className="mt-6 bg-indigo-50 px-4 py-2 rounded-full">
            <Text className="text-indigo-700 font-medium">Coming Soon</Text>
          </View>
        </View>
      </View>

      {/* Bottom Action Button */}
      <View className="px-4 pb-4">
        <TouchableOpacity className="bg-indigo-600 rounded-xl py-4 items-center">
          <Text className="text-white font-semibold text-base">Find Nearby Spots</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

