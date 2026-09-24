import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../utils/theme';
import { Feather } from '@expo/vector-icons';

export interface Category {
  id: string;
  label: string;
  icon: keyof typeof Feather.glyphMap;
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
              <Feather 
                name={cat.icon} 
                size={16} 
                color={isActive ? theme.colors.text.inverse : theme.colors.text.secondary} 
                style={styles.icon}
              />
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
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    letterSpacing: -0.5,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.pill,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...theme.shadows.sm,
  },
  chipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  icon: {
    marginRight: 8,
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
