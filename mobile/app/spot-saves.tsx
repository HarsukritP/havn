import React, { useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { spotSavesApi } from '../lib/api';
import { useAuthStore } from '../stores/authStore';

function SpotSavesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: savesData, isLoading } = useQuery({
    queryKey: ['spot-saves'],
    queryFn: async () => {
      const response = await spotSavesApi.getRequests();
      return response.data;
    },
    enabled: isAuthenticated,
  });

  const respondMutation = useMutation({
    mutationFn: ({ requestId, response }: { requestId: string; response: 'accepted' | 'declined' }) =>
      spotSavesApi.respondToRequest(requestId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spot-saves'] });
      Alert.alert('Success', 'Response sent!');
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message);
    },
  });

  const receivedRequests = savesData?.received_requests || [];
  const sentRequests = savesData?.sent_requests || [];

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Spot Saves</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="lock-closed-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyTitle}>Sign In Required</Text>
          <Text style={styles.emptyText}>Please sign in to view spot save requests</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Spot Saves</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'received' && styles.tabActive]}
          onPress={() => setActiveTab('received')}
        >
          <Text style={[styles.tabText, activeTab === 'received' && styles.tabTextActive]}>
            Received ({receivedRequests.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
          onPress={() => setActiveTab('sent')}
        >
          <Text style={[styles.tabText, activeTab === 'sent' && styles.tabTextActive]}>
            Sent ({sentRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        ) : activeTab === 'received' ? (
          receivedRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Requests</Text>
              <Text style={styles.emptyText}>You haven't received any spot save requests</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {receivedRequests.map((request: any) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.saverAvatar}>
                      <Text style={styles.saverAvatarText}>
                        {request.saver_name?.charAt(0) || request.saver_username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.saverName}>{request.saver_name || request.saver_username}</Text>
                      <Text style={styles.spotName}>
                        <Ionicons name="location" size={12} color="#6366f1" /> {request.spot_name}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      request.status === 'expired' && styles.statusBadgeExpired
                    ]}>
                      <Text style={styles.statusText}>{request.status}</Text>
                    </View>
                  </View>

                  {request.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageText}>{request.message}</Text>
                    </View>
                  )}

                  <Text style={styles.timeText}>{request.created_at_relative}</Text>

                  {request.status === 'pending' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.acceptButton]}
                        onPress={() => respondMutation.mutate({ 
                          requestId: request.id, 
                          response: 'accepted' 
                        })}
                        disabled={respondMutation.isPending}
                      >
                        <Ionicons name="checkmark" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.declineButton]}
                        onPress={() => respondMutation.mutate({ 
                          requestId: request.id, 
                          response: 'declined' 
                        })}
                        disabled={respondMutation.isPending}
                      >
                        <Ionicons name="close" size={20} color="white" />
                        <Text style={styles.actionButtonText}>Decline</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )
        ) : (
          sentRequests.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="bookmark-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyTitle}>No Requests</Text>
              <Text style={styles.emptyText}>You haven't sent any spot save requests</Text>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {sentRequests.map((request: any) => (
                <View key={request.id} style={styles.sentRequestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.saverAvatar}>
                      <Text style={styles.saverAvatarText}>
                        {request.requestee_name?.charAt(0) || request.requestee_username.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.requestInfo}>
                      <Text style={styles.saverName}>
                        {request.requestee_name || request.requestee_username}
                      </Text>
                      <Text style={styles.spotName}>
                        <Ionicons name="location" size={12} color="#6366f1" /> {request.spot_name}
                      </Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      request.status === 'accepted' && styles.statusBadgeAccepted,
                      request.status === 'declined' && styles.statusBadgeDeclined,
                      request.status === 'expired' && styles.statusBadgeExpired,
                    ]}>
                      <Text style={styles.statusText}>{request.status}</Text>
                    </View>
                  </View>

                  {request.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageText}>{request.message}</Text>
                    </View>
                  )}

                  <Text style={styles.timeText}>{request.created_at_relative}</Text>
                </View>
              ))}
            </View>
          )
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
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
  listContainer: {
    padding: 16,
  },
  requestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sentRequestCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  saverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  saverAvatarText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  requestInfo: {
    flex: 1,
  },
  saverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  spotName: {
    fontSize: 14,
    color: '#6366f1',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeAccepted: {
    backgroundColor: '#d1fae5',
  },
  statusBadgeDeclined: {
    backgroundColor: '#fee2e2',
  },
  statusBadgeExpired: {
    backgroundColor: '#f3f4f6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    textTransform: 'capitalize',
  },
  messageContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  acceptButton: {
    backgroundColor: '#10b981',
  },
  declineButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
});

SpotSavesScreen.displayName = 'SpotSavesScreen';

export default SpotSavesScreen;

