import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';

export interface Category {
  id: string;
  label: string;
  icon: string;
}

interface CategoryListProps {
  categories: Category[];
  title?: string;
  onSelect?: (category: Category) => void;
}

export const CategoryList: React.FC<CategoryListProps> = ({ categories, title, onSelect }) => {
  const [activeId, setActiveId] = useState<string | null>(null);

  const handlePress = (category: Category) => {
    setActiveId(category.id);
    if (onSelect) onSelect(category);
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {categories.map((cat) => {
          const isActive = activeId === cat.id;
          return (
            <TouchableOpacity 
              key={cat.id} 
              style={[styles.chip, isActive && styles.chipActive]} 
              onPress={() => handlePress(cat)}
              activeOpacity={0.7}
            >
              <Text style={styles.icon}>{cat.icon}</Text>
              <Text style={[styles.label, isActive && styles.labelActive]}>{cat.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xs, // Shadow room
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: 10,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  labelActive: {
    color: theme.colors.text.inverse,
  }
});
