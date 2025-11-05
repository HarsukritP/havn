import { View, Text, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FriendsScreen() {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-200 px-4 py-3">
        <Text className="text-2xl font-bold text-gray-900">Friends</Text>
        <Text className="text-sm text-gray-600">See where your friends are studying</Text>
      </View>

      {/* Content */}
      <ScrollView className="flex-1">
        <View className="items-center justify-center px-6 py-12">
          <Ionicons name="people-outline" size={80} color="#6366f1" />
          <Text className="text-2xl font-bold text-gray-900 mt-6">No Friends Yet</Text>
          <Text className="text-base text-gray-600 mt-2 text-center">
            Add friends to see where they're studying and coordinate study sessions
          </Text>
          
          {/* Features List */}
          <View className="mt-8 w-full">
            <View className="bg-white rounded-lg p-4 mb-3 flex-row items-center">
              <View className="bg-indigo-100 rounded-full p-2 mr-3">
                <Ionicons name="add-circle" size={24} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Add Friends</Text>
                <Text className="text-sm text-gray-600">Search by username</Text>
              </View>
            </View>

            <View className="bg-white rounded-lg p-4 mb-3 flex-row items-center">
              <View className="bg-green-100 rounded-full p-2 mr-3">
                <Ionicons name="location" size={24} color="#10b981" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">See Locations</Text>
                <Text className="text-sm text-gray-600">View where friends study</Text>
              </View>
            </View>

            <View className="bg-white rounded-lg p-4 flex-row items-center">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <Ionicons name="bookmark" size={24} color="#8b5cf6" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-gray-900">Save Spots</Text>
                <Text className="text-sm text-gray-600">Request spot saves</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

