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
  const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

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
                    <Text style={styles.userMeta}>@{user.username}</Text>
                  </View>
                  {user.is_friend ? (
                    <View style={styles.friendBadge}>
                      <Text style={styles.friendBadgeText}>Friends</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.addButton}
                      onPress={() => sendRequestMutation.mutate(user.id)}
                      disabled={sendRequestMutation.isPending}
                    >
                      <Ionicons name="add-circle" size={24} color="#6366f1" />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Requests ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {activeTab === 'friends' ? (
          friendsLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366f1" />
            </View>
          ) : friends.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Friends Yet</Text>
              <Text style={styles.emptyText}>
                Search for friends to start seeing where they study
              </Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {friends.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={styles.friendAvatar}>
                    <Text style={styles.friendAvatarText}>
                      {friend.full_name?.charAt(0) || friend.username.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.full_name || friend.username}</Text>
                    <Text style={styles.friendMeta}>
                      {friend.current_spot_name ? (
                        <>
                          <Ionicons name="location" size={12} color="#10b981" /> {friend.current_spot_name}
                        </>
                      ) : (
                        'Not checked in'
                      )}
                    </Text>
                  </View>
                  {friend.current_spot_name && (
                    <View style={styles.activeDot} />
                  )}
                </View>
              ))}
            </View>
          )
        ) : (
          <View style={styles.listContainer}>
            {receivedRequests.length === 0 && sentRequests.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="mail-outline" size={64} color="#9ca3af" />
                <Text style={styles.emptyTitle}>No Requests</Text>
                <Text style={styles.emptyText}>
                  You don't have any pending friend requests
                </Text>
              </View>
            ) : (
              <>
                {receivedRequests.length > 0 && (
                  <View style={styles.requestsSection}>
                    <Text style={styles.sectionTitle}>Received</Text>
                    {receivedRequests.map((request) => (
                      <View key={request.friendship_id} style={styles.requestCard}>
                        <View style={styles.requestInfo}>
                          <View style={styles.requestAvatar}>
                            <Text style={styles.requestAvatarText}>
                              {request.user.full_name?.charAt(0) || request.user.username.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.requestName}>
                              {request.user.full_name || request.user.username}
                            </Text>
                            <Text style={styles.requestMeta}>@{request.user.username}</Text>
                          </View>
                        </View>
                        <View style={styles.requestActions}>
                          <TouchableOpacity
                            style={[styles.requestButton, styles.acceptButton]}
                            onPress={() =>
                              respondToRequestMutation.mutate({
                                friendshipId: request.friendship_id,
                                response: 'accepted',
                              })
                            }
                          >
                            <Ionicons name="checkmark" size={20} color="white" />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.requestButton, styles.declineButton]}
                            onPress={() =>
                              respondToRequestMutation.mutate({
                                friendshipId: request.friendship_id,
                                response: 'declined',
                              })
                            }
                          >
                            <Ionicons name="close" size={20} color="white" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {sentRequests.length > 0 && (
                  <View style={styles.requestsSection}>
                    <Text style={styles.sectionTitle}>Sent</Text>
                    {sentRequests.map((request) => (
                      <View key={request.friendship_id} style={styles.sentRequestCard}>
                        <View style={styles.sentRequestAvatar}>
                          <Text style={styles.sentRequestAvatarText}>
                            {request.user.full_name?.charAt(0) || request.user.username.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <View style={styles.sentRequestInfo}>
                          <Text style={styles.sentRequestName}>
                            {request.user.full_name || request.user.username}
                          </Text>
                          <Text style={styles.sentRequestMeta}>Pending</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
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
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  userMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  friendBadge: {
    backgroundColor: '#d1fae5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  friendBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10b981',
  },
  addButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabActive: {
    backgroundColor: '#6366f1',
  },
  tabText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  tabTextActive: {
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  signInButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  signInButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  listContainer: {
    padding: 16,
  },
  friendCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  friendAvatarText: {
    fontSize: 20,
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
  friendMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  activeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  requestsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  requestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  requestAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  requestMeta: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  requestActions: {
    flexDirection: 'row',
    gap: 8,
  },
  requestButton: {
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
  sentRequestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sentRequestAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sentRequestAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  sentRequestInfo: {
    flex: 1,
  },
  sentRequestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  sentRequestMeta: {
    fontSize: 14,
    color: '#f59e0b',
    marginTop: 2,
  },
});

FriendsScreen.displayName = 'FriendsScreen';

export default FriendsScreen;
