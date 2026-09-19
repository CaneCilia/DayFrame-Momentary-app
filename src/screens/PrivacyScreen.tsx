import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../utils/theme';

export const PrivacyScreen = () => {
  const handleDeleteRequest = () => {
    Alert.alert(
      'Request Account Deletion',
      'Are you sure you want to request account deletion? This action cannot be undone and all cloud data will be permanently removed within 30 days.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Submit Request', 
          style: 'destructive',
          onPress: () => Alert.alert('Request Submitted', 'Your account deletion request has been submitted to our support team.')
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>Privacy Hub</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Local-First Architecture</Text>
          <Text style={styles.bodyText}>
            DayFrame is built with a local-first philosophy. This means that your photos and memories are saved directly to your device's local storage before anything else.
          </Text>
          <Text style={styles.bodyText}>
            You have complete ownership of your data. If you choose not to sign in or connect a cloud service, your data never leaves your device.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cloud Backup & Sync</Text>
          <Text style={styles.bodyText}>
            If you enable Cloud Sync or Google Drive backup, your data is securely transmitted over HTTPS. We do not sell your data to third parties, and it is strictly used to provide backup and multi-device synchronization features for you.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data Deletion</Text>
          <Text style={styles.bodyText}>
            Take control of your footprint. Account deletion will permanently erase your profile and all cloud-synced memories from our servers. This action will not affect photos saved locally on your device or in your personal Google Drive.
          </Text>
          <TouchableOpacity 
            style={styles.deleteButton} 
            onPress={handleDeleteRequest}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteButtonText}>Request Account Deletion</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: theme.colors.background 
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  section: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  bodyText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    lineHeight: 24,
    marginBottom: theme.spacing.md,
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.error || '#FF3B30',
    borderRadius: theme.borderRadius.pill,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  deleteButtonText: {
    color: theme.colors.error || '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  }
});
