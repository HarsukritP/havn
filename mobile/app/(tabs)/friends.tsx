import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { friendsApi, usersApi } from '../../lib/api';
import { useAuthStore } from '../../stores/authStore';

interface Friend {
  id: string;
  username: string;
  full_name?: string;
  current_spot_name?: string;
  checked_in_at?: string;
}

interface FriendRequest {
  friendship_id: string;
  user: Friend;
}

function FriendsScreen() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const { data: friendsData, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await friendsApi.getFriends();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const sendRequestMutation = useMutation({
    mutationFn: (friendId: string) => friendsApi.sendRequest(friendId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      Alert.alert('Success', 'Friend request sent!');
      setShowSearch(false);
      setSearchQuery('');
      setSearchResults([]);
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const respondToRequestMutation = useMutation({
    mutationFn: ({ friendshipId, response }: { friendshipId: string; response: 'accepted' | 'declined' }) =>
      friendsApi.respondToRequest(friendshipId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      Alert.alert('Success', 'Request updated!');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await usersApi.search(query);
      setSearchResults(response.data.users);
    } catch (error: any) {
      console.error('Search error:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const friends: Friend[] = friendsData?.friends || [];
  const receivedRequests: FriendRequest[] = friendsData?.received_requests || [];
  const sentRequests: FriendRequest[] = friendsData?.sent_requests || [];

  // Render not authenticated state
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Friends</Text>
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>Please sign in to view and add friends</Text>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.signInButtonText}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Render main content
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Friends</Text>
          <Text style={styles.subtitle}>
            {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
        >
          <Ionicons name={showSearch ? 'close' : 'person-add'} size={24} color="#6366f1" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputWrapper}>
            <Ionicons name="search" size={20} color="#9ca3af" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by username or email..."
              placeholderTextColor="#9ca3af"
              value={searchQuery}
              onChangeText={handleSearch}
              autoCapitalize="none"
            />
            {searchLoading && <ActivityIndicator size="small" color="#6366f1" />}
          </View>

          {searchResults.length > 0 && (
            <ScrollView style={styles.searchResults} keyboardShouldPersistTaps="handled">
              {searchResults.map((user) => (
                <View key={user.id} style={styles.searchResultItem}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>
                      {user.full_name?.charAt(0) || user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.full_name || user.username}</Text>
                    <Text style={styles.userEmail}>@{user.username}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => sendRequestMutation.mutate(user.id)}
                    disabled={sendRequestMutation.isPending}
                  >
                    {sendRequestMutation.isPending ? (
                      <ActivityIndicator size="small" color="#6366f1" />
                    ) : (
                      <Ionicons name="person-add" size={20} color="#6366f1" />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.activeTab]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.activeTabText]}>
            Friends
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.activeTab]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.activeTabText]}>
            Requests {(receivedRequests.length + sentRequests.length) > 0 && `(${receivedRequests.length + sentRequests.length})`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {friendsLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : activeTab === 'friends' ? (
        <ScrollView style={styles.content}>
          {friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptyText}>Search for users above to add friends</Text>
            </View>
          ) : (
            friends.map((friend) => (
              <View key={friend.id} style={styles.friendCard}>
                <View style={styles.friendAvatar}>
                  <Text style={styles.friendAvatarText}>
                    {friend.full_name?.charAt(0) || friend.username.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.friendInfo}>
                  <Text style={styles.friendName}>{friend.full_name || friend.username}</Text>
                  <Text style={styles.friendUsername}>@{friend.username}</Text>
                  {friend.current_spot_name && (
                    <View style={styles.locationBadge}>
                      <Ionicons name="location" size={12} color="#6366f1" />
                      <Text style={styles.locationText}>{friend.current_spot_name}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          {/* Received Requests */}
          {receivedRequests.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>Received Requests</Text>
              {receivedRequests.map((request) => (
                <View key={request.friendship_id} style={styles.requestCard}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {request.user.full_name?.charAt(0) || request.user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{request.user.full_name || request.user.username}</Text>
                    <Text style={styles.friendUsername}>@{request.user.username}</Text>
                  </View>
                  <View style={styles.requestActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() => respondToRequestMutation.mutate({
                        friendshipId: request.friendship_id,
                        response: 'accepted'
                      })}
                      disabled={respondToRequestMutation.isPending}
                    >
                      <Ionicons name="checkmark" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.declineButton]}
                      onPress={() => respondToRequestMutation.mutate({
                        friendshipId: request.friendship_id,
                        response: 'declined'
                      })}
                      disabled={respondToRequestMutation.isPending}
                    >
                      <Ionicons name="close" size={20} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </>
          )}

          {/* Sent Requests */}
          {sentRequests.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, receivedRequests.length > 0 && { marginTop: 24 }]}>
                Sent Requests
              </Text>
              {sentRequests.map((request) => (
                <View key={request.friendship_id} style={styles.requestCard}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {request.user.full_name?.charAt(0) || request.user.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{request.user.full_name || request.user.username}</Text>
                    <Text style={styles.friendUsername}>@{request.user.username}</Text>
                    <Text style={styles.pendingText}>Pending...</Text>
                  </View>
                </View>
              ))}
            </>
          )}

          {receivedRequests.length === 0 && sentRequests.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="mail-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Requests</Text>
              <Text style={styles.emptyText}>You don't have any friend requests</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: '#111827',
  },
  searchResults: {
    maxHeight: 300,
    marginTop: 12,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatarText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userEmail: {
    fontSize: 14,
    color: '#6b7280',
  },
  addButton: {
    padding: 8,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#6366f1',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
  },
  activeTabText: {
    color: '#6366f1',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
  },
  signInButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 16,
  },
  signInButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  friendAvatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  friendInfo: {
    flex: 1,
    marginLeft: 12,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  friendUsername: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  locationText: {
    fontSize: 12,
    color: '#6366f1',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  requestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  pendingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

FriendsScreen.displayName = 'FriendsScreen';

export default FriendsScreen;
