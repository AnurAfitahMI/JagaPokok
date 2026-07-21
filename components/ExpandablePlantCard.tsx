// components/ExpandablePlantCard.tsx
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Animated,
    Image,
    LayoutAnimation,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View
} from 'react-native';
import { Colors } from '../constants/Colors';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ExpandablePlantCardProps {
  plant: {
    id: string;
    name: string;
    scientificName?: string;
    imageUrl?: string;
    addedAt?: string;
    reminders?: {
      id: string;
      type: string;
      title: string;
      nextDate: string;
      priority: 'high' | 'medium' | 'low';
      notes?: string;
      icon?: string;
      isEnabled: boolean;
    }[];
  };
  onPress: () => void;
  onDelete: () => void;
  onCompleteReminder: (reminderId: string) => void;
  onSnoozeReminder: (reminderId: string, hours: number) => void;
}

export default function ExpandablePlantCard({
  plant,
  onPress,
  onDelete,
  onCompleteReminder,
  onSnoozeReminder
}: ExpandablePlantCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  // Filter active reminders and sort by date
  const activeReminders = (plant.reminders || [])
    .filter(reminder => reminder.isEnabled)
    .sort((a, b) => new Date(a.nextDate).getTime() - new Date(b.nextDate).getTime());
  
  // Get upcoming reminders (within 7 days)
  const upcomingReminders = activeReminders.filter(reminder => {
    const nextDate = new Date(reminder.nextDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return nextDate <= sevenDaysFromNow;
  });
  
  // Get overdue reminders
  const overdueReminders = activeReminders.filter(reminder => {
    return new Date(reminder.nextDate) < new Date();
  });
  
  // Get today's reminders
  const todaysReminders = activeReminders.filter(reminder => {
    const today = new Date();
    const reminderDate = new Date(reminder.nextDate);
    return reminderDate.toDateString() === today.toDateString();
  });
  
  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#FF4500';
      case 'medium': return '#FF9800';
      case 'low': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      if (date.toDateString() === today.toDateString()) {
        return 'Today';
      } else if (date.toDateString() === tomorrow.toDateString()) {
        return 'Tomorrow';
      } else {
        const diffDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return `In ${diffDays} days`;
      }
    } catch {
      return 'Soon';
    }
  };
  
  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'watering': return 'watering-can';
      case 'fertilizing': return 'leaf';
      case 'rotating': return 'rotate-360';
      case 'repotting': return 'shovel';
      default: return 'bell';
    }
  };

  return (
    <View style={styles.container}>
      {/* Plant Info Row */}
      <TouchableOpacity 
        style={styles.plantRow}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {/* Plant Image */}
        {plant.imageUrl ? (
          <Image source={{ uri: plant.imageUrl }} style={styles.plantImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="flower" size={32} color={Colors.primary} />
          </View>
        )}
        
        {/* Plant Details */}
        <View style={styles.plantDetails}>
          <Text style={styles.plantName}>{plant.name}</Text>
          {plant.scientificName && (
            <Text style={styles.scientificName}>{plant.scientificName}</Text>
          )}
          
          {/* Reminder Summary */}
          {upcomingReminders.length > 0 && (
            <View style={styles.reminderSummary}>
              {overdueReminders.length > 0 ? (
                <View style={styles.urgentBadge}>
                  <MaterialCommunityIcons name="alert" size={12} color={Colors.white} />
                  <Text style={styles.urgentText}>
                    {overdueReminders.length} overdue
                  </Text>
                </View>
              ) : todaysReminders.length > 0 ? (
                <View style={styles.todayBadge}>
                  <MaterialCommunityIcons name="clock-alert" size={12} color={Colors.white} />
                  <Text style={styles.todayText}>
                    {todaysReminders.length} today
                  </Text>
                </View>
              ) : (
                <View style={styles.upcomingBadge}>
                  <MaterialCommunityIcons name="calendar-clock" size={12} color={Colors.white} />
                  <Text style={styles.upcomingText}>
                    {upcomingReminders.length} upcoming
                  </Text>
                </View>
              )}
            </View>
          )}
          
          {/* Added Date */}
          {plant.addedAt && (
            <Text style={styles.addedDate}>
              Added: {new Date(plant.addedAt).toLocaleDateString('en-MY')}
            </Text>
          )}
        </View>
        
        {/* Expand/Collapse Button */}
        {upcomingReminders.length > 0 && (
          <TouchableOpacity 
            style={styles.expandButton}
            onPress={toggleExpand}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MaterialCommunityIcons 
              name={expanded ? "chevron-up" : "chevron-down"} 
              size={24} 
              color={Colors.textSecondary} 
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      
      {/* Expandable Reminders Section */}
      {expanded && upcomingReminders.length > 0 && (
        <Animated.View style={styles.remindersContainer}>
          <View style={styles.remindersHeader}>
            <Text style={styles.remindersTitle}>Upcoming Tasks</Text>
            <Text style={styles.remindersCount}>{upcomingReminders.length}</Text>
          </View>
          
          {upcomingReminders.map((reminder) => {
            const isOverdue = new Date(reminder.nextDate) < new Date();
            const isToday = new Date(reminder.nextDate).toDateString() === new Date().toDateString();
            
            return (
              <View 
                key={reminder.id} 
                style={[
                  styles.reminderItem,
                  isOverdue && styles.overdueReminder,
                  isToday && styles.todayReminder
                ]}
              >
                {/* Reminder Icon */}
                <View style={[
                  styles.reminderIconContainer,
                  { backgroundColor: getPriorityColor(reminder.priority) + '20' }
                ]}>
                  <MaterialCommunityIcons 
                    name={getReminderIcon(reminder.type)} 
                    size={18} 
                    color={getPriorityColor(reminder.priority)} 
                  />
                </View>
                
                {/* Reminder Details */}
                <View style={styles.reminderDetails}>
                  <Text style={styles.reminderTitle}>{reminder.title}</Text>
                  <View style={styles.reminderMeta}>
                    <MaterialCommunityIcons name="calendar" size={12} color={Colors.textSecondary} />
                    <Text style={[
                      styles.reminderDate,
                      isOverdue && styles.overdueText
                    ]}>
                      {isOverdue ? 'Overdue • ' : ''}{formatDate(reminder.nextDate)}
                    </Text>
                    {reminder.priority === 'high' && (
                      <View style={[
                        styles.priorityBadge,
                        { backgroundColor: getPriorityColor(reminder.priority) + '20' }
                      ]}>
                        <Text style={[
                          styles.priorityText,
                          { color: getPriorityColor(reminder.priority) }
                        ]}>
                          Priority
                        </Text>
                      </View>
                    )}
                  </View>
                  
                  {reminder.notes && (
                    <Text style={styles.reminderNotes} numberOfLines={2}>
                      {reminder.notes}
                    </Text>
                  )}
                </View>
                
                {/* Reminder Actions */}
                <View style={styles.reminderActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.completeButton]}
                    onPress={() => onCompleteReminder(reminder.id)}
                  >
                    <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.snoozeButton]}
                    onPress={() => onSnoozeReminder(reminder.id, 24)}
                  >
                    <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.text} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
          
          {/* View All Reminders Link */}
          {activeReminders.length > upcomingReminders.length && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>
                View all {activeReminders.length} reminders
              </Text>
              <MaterialCommunityIcons name="chevron-right" size={16} color={Colors.primary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      )}
      
      {/* Delete Button (always visible) */}
      <TouchableOpacity 
        style={styles.deleteButton}
        onPress={onDelete}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <MaterialCommunityIcons 
          name="trash-can-outline" 
          size={18} 
          color={Colors.textSecondary} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginHorizontal: 16,
    marginBottom: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  plantRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  placeholderImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantDetails: {
    flex: 1,
    marginLeft: 12,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  reminderSummary: {
    marginBottom: 4,
  },
  urgentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF450020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  urgentText: {
    fontSize: 11,
    color: '#FF4500',
    fontWeight: '600',
  },
  todayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF980020',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  todayText: {
    fontSize: 11,
    color: '#FF9800',
    fontWeight: '600',
  },
  upcomingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
  },
  upcomingText: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
  },
  addedDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  expandButton: {
    padding: 4,
  },
  remindersContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  remindersHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  remindersTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  remindersCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Colors.primary,
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  reminderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  overdueReminder: {
    backgroundColor: '#FF450010',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4500',
  },
  todayReminder: {
    backgroundColor: '#FF980010',
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  reminderIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  reminderDetails: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  reminderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
    flexWrap: 'wrap',
  },
  reminderDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  overdueText: {
    color: '#FF4500',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  reminderNotes: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    lineHeight: 16,
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 6,
    marginLeft: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  snoozeButton: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 4,
  },
  viewAllText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  deleteButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 4,
  },
});