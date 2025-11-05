import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi, spotSavesApi } from '../lib/api';

interface SpotSaveRequestModalProps {
  visible: boolean;
  spotId: string;
  spotName: string;
  onClose: () => void;
}

export function SpotSaveRequestModal({
  visible,
  spotId,
  spotName,
  onClose,
}: SpotSaveRequestModalProps) {
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: friendsData, isLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await friendsApi.getFriends();
      return response.data;
    },
    enabled: visible,
  });

  const createRequestMutation = useMutation({
    mutationFn: () => {
      if (!selectedFriendId) throw new Error('Please select a friend');
      return spotSavesApi.createRequest({
        spot_id: spotId,
        saver_id: selectedFriendId,
        message: message || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spot-saves'] });
      Alert.alert('Success', 'Spot save request sent!');
      onClose();
      setSelectedFriendId(null);
      setMessage('');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const friends = friendsData?.friends || [];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Request Spot Save</Text>
          <TouchableOpacity
            onPress={() => createRequestMutation.mutate()}
            disabled={!selectedFriendId || createRequestMutation.isPending}
          >
            {createRequestMutation.isPending ? (
              <ActivityIndicator size="small" color="#6366f1" />
            ) : (
              <Text
                style={[
                  styles.sendText,
                  !selectedFriendId && styles.sendTextDisabled,
                ]}
              >
                Send
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.spotInfo}>
            <Ionicons name="location" size={24} color="#6366f1" />
            <Text style={styles.spotName}>{spotName}</Text>
          </View>

          <Text style={styles.sectionTitle}>Select a Friend</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#6366f1" style={styles.loading} />
          ) : friends.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No friends available</Text>
            </View>
          ) : (
            friends.map((friend: any) => (
              <TouchableOpacity
                key={friend.id}
                style={[
                  styles.friendItem,
                  selectedFriendId === friend.id && styles.friendItemSelected,
                ]}
                onPress={() => setSelectedFriendId(friend.id)}
              >
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>
                    {friend.full_name?.charAt(0) || friend.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.full_name || friend.username}</Text>
                  {friend.current_spot_name && (
                    <Text style={styles.friendLocation}>
                      <Ionicons name="location" size={12} color="#10b981" /> {friend.current_spot_name}
                    </Text>
                  )}
                </View>
                {selectedFriendId === friend.id && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366f1" />
                )}
              </TouchableOpacity>
            ))
          )}

          <Text style={styles.sectionTitle}>Message (Optional)</Text>
          <TextInput
            style={styles.messageInput}
            placeholder="Add a message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            maxLength={200}
          />
          <Text style={styles.charCount}>{message.length}/200</Text>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cancelText: {
    fontSize: 16,
    color: '#6b7280',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  sendText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6366f1',
  },
  sendTextDisabled: {
    color: '#9ca3af',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  spotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#eef2ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  spotName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  loading: {
    marginVertical: 24,
  },
  emptyState: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#9ca3af',
  },
  friendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  friendItemSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#eef2ff',
  },
  friendAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  friendLocation: {
    fontSize: 14,
    color: '#10b981',
    marginTop: 2,
  },
  messageInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    height: 100,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 24,
  },
});

