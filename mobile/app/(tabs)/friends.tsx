import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function FriendsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Friends</Text>
        <Text style={styles.subtitle}>See where your friends are studying</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Ionicons name="people-outline" size={80} color="#6366f1" />
          <Text style={styles.heading}>No Friends Yet</Text>
          <Text style={styles.description}>
            Add friends to see where they're studying and coordinate study sessions
          </Text>
          
          {/* Features List */}
          <View style={styles.featureList}>
            <View style={styles.featureCard}>
              <View style={[styles.iconCircle, { backgroundColor: '#e0e7ff' }]}>
                <Ionicons name="add-circle" size={24} color="#6366f1" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Add Friends</Text>
                <Text style={styles.featureSubtitle}>Search by username</Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.iconCircle, { backgroundColor: '#d1fae5' }]}>
                <Ionicons name="location" size={24} color="#10b981" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>See Locations</Text>
                <Text style={styles.featureSubtitle}>View where friends study</Text>
              </View>
            </View>

            <View style={[styles.featureCard, { marginBottom: 0 }]}>
              <View style={[styles.iconCircle, { backgroundColor: '#ede9fe' }]}>
                <Ionicons name="bookmark" size={24} color="#8b5cf6" />
              </View>
              <View style={styles.featureText}>
                <Text style={styles.featureTitle}>Save Spots</Text>
                <Text style={styles.featureSubtitle}>Request spot saves</Text>
              </View>
            </View>
          </View>
        </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
  },
  description: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  featureList: {
    marginTop: 32,
    width: '100%',
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    borderRadius: 20,
    padding: 8,
    marginRight: 12,
  },
  featureText: {
    flex: 1,
  },
  featureTitle: {
    fontWeight: '600',
    color: '#111827',
    fontSize: 16,
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
});

FriendsScreen.displayName = 'FriendsScreen';

export default FriendsScreen;
