import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { theme } from '../utils/theme';
import { Memory } from '../database/memories';

interface MonthSummaryCardProps {
  title: string;
  memories: Memory[];
}

export const MonthSummaryCard: React.FC<MonthSummaryCardProps> = ({ title, memories }) => {
  const previewImages = memories.slice(0, 3);
  const totalCount = memories.length;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title} Highlights</Text>
        <Text style={styles.subtitle}>
          {totalCount} {totalCount === 1 ? 'memory' : 'memories'}
        </Text>
      </View>
      
      {previewImages.length > 0 && (
        <View style={styles.card}>
          <View style={styles.collage}>
            {previewImages.length === 1 && (
              <Image source={{ uri: previewImages[0].photoUri }} style={styles.fullImage} />
            )}
            
            {previewImages.length === 2 && (
              <View style={styles.twoImageContainer}>
                <Image source={{ uri: previewImages[0].photoUri }} style={[styles.halfImage, { marginRight: 2 }]} />
                <Image source={{ uri: previewImages[1].photoUri }} style={styles.halfImage} />
              </View>
            )}
            
            {previewImages.length >= 3 && (
              <View style={styles.threeImageContainer}>
                <Image source={{ uri: previewImages[0].photoUri }} style={[styles.mainImage, { marginRight: 2 }]} />
                <View style={styles.sideImages}>
                  <Image source={{ uri: previewImages[1].photoUri }} style={[styles.smallImage, { marginBottom: 2 }]} />
                  <Image source={{ uri: previewImages[2].photoUri }} style={styles.smallImage} />
                </View>
              </View>
            )}
          </View>
          <View style={styles.cardFooter}>
             <Text style={styles.cardFooterText}>Memories of {title.split(' ')[0]}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.text.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  collage: {
    height: 200,
    width: '100%',
    backgroundColor: theme.colors.border,
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  twoImageContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  halfImage: {
    flex: 1,
    height: '100%',
  },
  threeImageContainer: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  mainImage: {
    flex: 2,
    height: '100%',
  },
  sideImages: {
    flex: 1,
    height: '100%',
    flexDirection: 'column',
  },
  smallImage: {
    flex: 1,
    width: '100%',
  },
  cardFooter: {
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
  },
  cardFooterText: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
  }
});
