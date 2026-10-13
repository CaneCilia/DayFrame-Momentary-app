import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../utils/theme';
import { UnifiedTimelineItem, TimelineItemType } from '../database/timelineEvents';

export type ZoomLevel = 'Day' | 'Week' | 'Month' | 'Year';

interface HorizontalTimelineProps {
  items: UnifiedTimelineItem[];
  onSelectItem: (item: UnifiedTimelineItem) => void;
  selectedDate?: string; // YYYY-MM-DD
}

const FILTER_TYPES: { key: string; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: 'all', label: 'All', icon: 'grid' },
  { key: 'photo', label: 'Photos', icon: 'camera' },
  { key: 'memory', label: 'Memories', icon: 'heart' },
  { key: 'event', label: 'Events', icon: 'calendar' },
  { key: 'note', label: 'Notes', icon: 'file-text' },
  { key: 'milestone', label: 'Milestones', icon: 'flag' },
];

const ZOOM_OPTIONS: ZoomLevel[] = ['Day', 'Week', 'Month', 'Year'];

export const HorizontalTimeline: React.FC<HorizontalTimelineProps> = ({
  items,
  onSelectItem,
  selectedDate,
}) => {
  const [zoom, setZoom] = useState<ZoomLevel>('Month');
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Filter items based on active filter chip
  const filteredItems = useMemo(() => {
    if (activeFilter === 'all') return items;
    return items.filter((item) => item.type === activeFilter);
  }, [items, activeFilter]);

  // Determine current viewing month & year from selectedDate or today
  const baseDate = useMemo(() => {
    if (selectedDate && !isNaN(Date.parse(selectedDate))) {
      return new Date(selectedDate);
    }
    return new Date();
  }, [selectedDate]);

  const currentMonthName = baseDate.toLocaleString('default', { month: 'short' });
  const currentYear = baseDate.getFullYear();

  // Generate X-axis ticks based on Zoom level
  const timeTicks = useMemo(() => {
    switch (zoom) {
      case 'Day':
        return [
          { label: '00:00', value: 0 },
          { label: '04:00', value: 4 },
          { label: '08:00', value: 8 },
          { label: '12:00', value: 12 },
          { label: '16:00', value: 16 },
          { label: '20:00', value: 20 },
          { label: '24:00', value: 24 },
        ];
      case 'Week':
        return [
          { label: 'Mon', value: 1 },
          { label: 'Tue', value: 2 },
          { label: 'Wed', value: 3 },
          { label: 'Thu', value: 4 },
          { label: 'Fri', value: 5 },
          { label: 'Sat', value: 6 },
          { label: 'Sun', value: 7 },
        ];
      case 'Year':
        return [
          { label: 'Jan', value: 1 },
          { label: 'Feb', value: 2 },
          { label: 'Mar', value: 3 },
          { label: 'Apr', value: 4 },
          { label: 'May', value: 5 },
          { label: 'Jun', value: 6 },
          { label: 'Jul', value: 7 },
          { label: 'Aug', value: 8 },
          { label: 'Sep', value: 9 },
          { label: 'Oct', value: 10 },
          { label: 'Nov', value: 11 },
          { label: 'Dec', value: 12 },
        ];
      case 'Month':
      default:
        return [
          { label: `${currentMonthName} 1`, value: 1 },
          { label: `${currentMonthName} 5`, value: 5 },
          { label: `${currentMonthName} 10`, value: 10 },
          { label: `${currentMonthName} 15`, value: 15 },
          { label: `${currentMonthName} 20`, value: 20 },
          { label: `${currentMonthName} 25`, value: 25 },
          { label: `${currentMonthName} 30`, value: 30 },
        ];
    }
  }, [zoom, currentMonthName]);

  // Width of timeline canvas
  const timelineCanvasWidth = zoom === 'Month' || zoom === 'Year' ? 840 : 680;
  const yTracks = [0, 2, 4, 6, 8]; // Vertical track markers requested (0, 2, 4, 6, 8)

  // Calculate position & width of an item bar
  const getItemBarMetrics = (item: UnifiedTimelineItem, index: number) => {
    let xOffset = 20;
    let barWidth = 100;

    const itemDay = parseInt(item.date.split('-')[2] || '1', 10);
    const itemMonth = parseInt(item.date.split('-')[1] || '1', 10);

    if (zoom === 'Month') {
      const normalizedDay = Math.min(Math.max(itemDay, 1), 31);
      xOffset = 30 + ((normalizedDay - 1) / 30) * (timelineCanvasWidth - 140);
      barWidth = Math.min(Math.max((item.durationHours || 2) * 16, 80), 220);
    } else if (zoom === 'Day') {
      const randomHour = (index * 3) % 20;
      xOffset = 30 + (randomHour / 24) * (timelineCanvasWidth - 140);
      barWidth = Math.min(Math.max((item.durationHours || 2) * 22, 70), 200);
    } else if (zoom === 'Week') {
      const dayOfWeek = (itemDay % 7);
      xOffset = 30 + (dayOfWeek / 7) * (timelineCanvasWidth - 140);
      barWidth = Math.min(Math.max((item.durationHours || 2) * 18, 75), 180);
    } else if (zoom === 'Year') {
      xOffset = 30 + ((itemMonth - 1) / 12) * (timelineCanvasWidth - 140);
      barWidth = Math.min(Math.max((item.durationHours || 2) * 14, 60), 160);
    }

    // Assign to one of the tracks: 0, 2, 4, 6, 8
    const trackIndex = index % yTracks.length;
    const yOffset = 20 + trackIndex * 38;

    return { xOffset, yOffset, barWidth };
  };

  const getItemIcon = (type: TimelineItemType): keyof typeof Feather.glyphMap => {
    switch (type) {
      case 'photo':
        return 'camera';
      case 'memory':
        return 'heart';
      case 'event':
        return 'calendar';
      case 'note':
        return 'file-text';
      case 'milestone':
        return 'flag';
      default:
        return 'calendar';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header controls: Title & Zoom selector */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.sectionTitle}>Memory Timeline</Text>
          <Text style={styles.subtitle}>
            Showing memories and events across {zoom.toLowerCase()}
          </Text>
        </View>

        {/* Zoom selector */}
        <View style={styles.zoomContainer}>
          {ZOOM_OPTIONS.map((z) => {
            const isSelected = zoom === z;
            return (
              <TouchableOpacity
                key={z}
                onPress={() => setZoom(z)}
                style={[styles.zoomPill, isSelected && styles.zoomPillActive]}
                activeOpacity={0.7}
              >
                <Text style={[styles.zoomPillText, isSelected && styles.zoomPillTextActive]}>
                  {z}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Filter chips: Photos · Memories · Events · Notes */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterScroll}
      >
        {FILTER_TYPES.map((filter) => {
          const isActive = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              onPress={() => setActiveFilter(filter.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.7}
            >
              <Feather
                name={filter.icon}
                size={13}
                color={isActive ? '#FFFFFF' : theme.colors.text.secondary}
                style={{ marginRight: 5 }}
              />
              <Text style={[styles.filterChipText, isActive && styles.filterChipTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Timeline Visual Canvas Card */}
      <View style={styles.timelineCard}>
        <View style={styles.canvasWrapper}>
          {/* Vertical Y-axis numbers (0, 2, 4, 6, 8) */}
          <View style={styles.yAxisLabels}>
            {yTracks.map((val) => (
              <View key={`y-${val}`} style={styles.yTick}>
                <Text style={styles.yTickText}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Horizontal Scrollable Timeline Area */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={[styles.horizontalScrollContent, { width: timelineCanvasWidth }]}
          >
            <View style={[styles.timelineCanvas, { width: timelineCanvasWidth }]}>
              {/* Horizontal guideline tracks */}
              {yTracks.map((val, idx) => (
                <View
                  key={`guide-${val}`}
                  style={[
                    styles.guideTrack,
                    { top: 20 + idx * 38 + 14 }
                  ]}
                />
              ))}

              {/* Vertical guideline ticks for X-axis */}
              <View style={styles.gridLinesContainer}>
                {timeTicks.map((tick, i) => {
                  const leftPos = 30 + (i / (timeTicks.length - 1)) * (timelineCanvasWidth - 140);
                  return (
                    <View
                      key={`grid-${i}`}
                      style={[styles.verticalGridLine, { left: leftPos }]}
                    />
                  );
                })}
              </View>

              {/* Memory & Event Bars */}
              {filteredItems.map((item, idx) => {
                const { xOffset, yOffset, barWidth } = getItemBarMetrics(item, idx);
                const barColor = item.color || theme.colors.primary;

                return (
                  <TouchableOpacity
                    key={item.id}
                    onPress={() => onSelectItem(item)}
                    activeOpacity={0.85}
                    style={[
                      styles.timelineBar,
                      {
                        left: xOffset,
                        top: yOffset,
                        width: barWidth,
                        backgroundColor: barColor,
                      },
                    ]}
                  >
                    {item.photoUri ? (
                      <Image source={{ uri: item.photoUri }} style={styles.barThumb} />
                    ) : (
                      <View style={styles.barIconCircle}>
                        <Feather name={getItemIcon(item.type)} size={11} color="#FFFFFF" />
                      </View>
                    )}

                    <Text style={styles.barTitle} numberOfLines={1}>
                      {item.title}
                    </Text>

                    <View style={styles.barDurationPill}>
                      <Text style={styles.barDurationText}>
                        {item.durationHours >= 24
                          ? `${Math.round(item.durationHours / 24)}d`
                          : `${item.durationHours}h`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* X-axis time tick labels along the bottom */}
            <View style={[styles.xAxisContainer, { width: timelineCanvasWidth }]}>
              {timeTicks.map((tick, i) => {
                const leftPos = 30 + (i / (timeTicks.length - 1)) * (timelineCanvasWidth - 140);
                return (
                  <View key={`tick-${i}`} style={[styles.xTickWrapper, { left: leftPos }]}>
                    <View style={styles.xTickMark} />
                    <Text style={styles.xTickLabel}>{tick.label}</Text>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Timeline Footer Legend & Count */}
        <View style={styles.timelineFooter}>
          <Text style={styles.itemsCountText}>
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} on timeline
          </Text>
          <View style={styles.timelineLegend}>
            <View style={styles.legendDotItem}>
              <View style={[styles.legendDot, { backgroundColor: '#6C5CE7' }]} />
              <Text style={styles.legendLabel}>Memory</Text>
            </View>
            <View style={styles.legendDotItem}>
              <View style={[styles.legendDot, { backgroundColor: '#00B894' }]} />
              <Text style={styles.legendLabel}>Event</Text>
            </View>
            <View style={styles.legendDotItem}>
              <View style={[styles.legendDot, { backgroundColor: '#0984E3' }]} />
              <Text style={styles.legendLabel}>Photo</Text>
            </View>
            <View style={styles.legendDotItem}>
              <View style={[styles.legendDot, { backgroundColor: '#F39C12' }]} />
              <Text style={styles.legendLabel}>Note</Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  topBar: {
    paddingHorizontal: theme.spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text.primary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 12,
    color: theme.colors.text.secondary,
    marginTop: 2,
  },
  zoomContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.04)',
    borderRadius: theme.borderRadius.pill,
    padding: 3,
  },
  zoomPill: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: theme.borderRadius.pill,
  },
  zoomPillActive: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.sm,
  },
  zoomPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  zoomPillTextActive: {
    color: theme.colors.text.primary,
    fontWeight: '800',
  },
  filterScroll: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: theme.borderRadius.pill,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    ...theme.shadows.sm,
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.text.primary,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timelineCard: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.xs,
    borderRadius: theme.borderRadius.xl,
    paddingVertical: theme.spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.03)',
    ...theme.shadows.md,
  },
  canvasWrapper: {
    flexDirection: 'row',
    height: 240,
  },
  yAxisLabels: {
    width: 28,
    paddingTop: 10,
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.05)',
  },
  yTick: {
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  yTickText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  horizontalScrollContent: {
    height: 240,
    flexDirection: 'column',
  },
  timelineCanvas: {
    height: 200,
    position: 'relative',
  },
  guideTrack: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
  },
  gridLinesContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  verticalGridLine: {
    position: 'absolute',
    top: 10,
    bottom: 0,
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  timelineBar: {
    position: 'absolute',
    height: 30,
    borderRadius: theme.borderRadius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    ...theme.shadows.sm,
  },
  barThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  barIconCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 5,
  },
  barTitle: {
    flex: 1,
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  barDurationPill: {
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 4,
  },
  barDurationText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  xAxisContainer: {
    height: 34,
    position: 'relative',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  xTickWrapper: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    transform: [{ translateX: -20 }],
  },
  xTickMark: {
    width: 1,
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginBottom: 3,
  },
  xTickLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  timelineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.03)',
  },
  itemsCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: theme.colors.text.secondary,
  },
  timelineLegend: {
    flexDirection: 'row',
    gap: 10,
  },
  legendDotItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginRight: 4,
  },
  legendLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
});
