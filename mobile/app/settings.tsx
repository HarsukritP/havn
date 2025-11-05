import React from 'react';
import {
  View,
  Text,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

function SettingsScreen() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationSharingEnabled, setLocationSharingEnabled] = React.useState(true);
  const [autoCheckoutEnabled, setAutoCheckoutEnabled] = React.useState(true);

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    if (value) {
      Alert.alert('Notifications Enabled', 'You will receive notifications for friend requests, spot saves, and more.');
    } else {
      Alert.alert('Notifications Disabled', 'You will not receive any notifications.');
    }
  };

  const handleLocationSharingToggle = (value: boolean) => {
    setLocationSharingEnabled(value);
    if (value) {
      Alert.alert('Location Sharing Enabled', 'Your friends will be able to see your location when you check in.');
    } else {
      Alert.alert('Location Sharing Disabled', 'Your friends will not see your location.');
    }
  };

  const handleAutoCheckoutToggle = (value: boolean) => {
    setAutoCheckoutEnabled(value);
    if (value) {
      Alert.alert('Auto Checkout Enabled', 'You will be automatically checked out after 4 hours of inactivity.');
    } else {
      Alert.alert('Auto Checkout Disabled', 'You must manually check out when you leave a spot.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications" size={24} color="#6366f1" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Push Notifications</Text>
                <Text style={styles.settingSubtext}>
                  Get notified about friend requests and spot saves
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={notificationsEnabled ? '#6366f1' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Privacy Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="location" size={24} color="#6366f1" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Location Sharing</Text>
                <Text style={styles.settingSubtext}>
                  Allow friends to see your location when checked in
                </Text>
              </View>
            </View>
            <Switch
              value={locationSharingEnabled}
              onValueChange={handleLocationSharingToggle}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={locationSharingEnabled ? '#6366f1' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Check-in Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Check-in</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="time" size={24} color="#6366f1" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Auto Checkout</Text>
                <Text style={styles.settingSubtext}>
                  Automatically check out after 4 hours of inactivity
                </Text>
              </View>
            </View>
            <Switch
              value={autoCheckoutEnabled}
              onValueChange={handleAutoCheckoutToggle}
              trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
              thumbColor={autoCheckoutEnabled ? '#6366f1' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          
          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="help-circle-outline" size={24} color="#6366f1" />
              <Text style={styles.settingText}>Help & Support</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="document-text-outline" size={24} color="#6366f1" />
              <Text style={styles.settingText}>Privacy Policy</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={24} color="#6366f1" />
              <Text style={styles.settingText}>Terms of Service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version 1.0.0 (MVP)</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  settingSubtext: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  versionText: {
    fontSize: 14,
    color: '#9ca3af',
  },
});

SettingsScreen.displayName = 'SettingsScreen';

export default SettingsScreen;

