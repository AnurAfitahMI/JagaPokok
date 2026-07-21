import { MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/Colors';

interface ReminderCardProps {
  reminder: {
    id: string;
    type: string;
    title: string;
    nextDate: string;
    priority: 'high' | 'medium' | 'low';
    notes?: string;
    icon?: string;
    isEnabled: boolean;
  };
  onComplete: () => void;
  onSnooze: () => void;
}

export default function ReminderCard({ reminder, onComplete, onSnooze }: ReminderCardProps) {
  const getPriorityColor = () => {
    switch (reminder.priority) {
      case 'high': return '#FF4500'; // Your chosen color
      case 'medium': return '#FF9800';
      case 'low': return Colors.primary;
      default: return Colors.textSecondary;
    }
  };

  const getIconName = () => {
    if (reminder.icon) return reminder.icon;
    switch (reminder.type) {
      case 'watering': return 'watering-can';
      case 'fertilizing': return 'leaf';
      case 'rotating': return 'rotate-360';
      case 'repotting': return 'shovel';
      default: return 'bell';
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
        return date.toLocaleDateString('en-MY', {
          day: 'numeric',
          month: 'short',
        });
      }
    } catch {
      return 'Soon';
    }
  };

  const isOverdue = () => {
    try {
      return new Date(reminder.nextDate) < new Date();
    } catch {
      return false;
    }
  };

  const overdue = isOverdue();

  return (
    <View style={[
      styles.container,
      { borderLeftColor: getPriorityColor() }
    ]}>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons 
          name={getIconName()} 
          size={24} 
          color={getPriorityColor()} 
        />
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{reminder.title}</Text>
        <View style={styles.dateContainer}>
          <MaterialCommunityIcons name="calendar" size={14} color={Colors.textSecondary} />
          <Text style={[
            styles.date,
            overdue && styles.overdueDate
          ]}>
            {overdue ? 'Overdue: ' : ''}{formatDate(reminder.nextDate)}
          </Text>
          {reminder.priority === 'high' && (
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor() + '20' }]}>
              <Text style={[styles.priorityText, { color: getPriorityColor() }]}>Urgent</Text>
            </View>
          )}
        </View>
        
        {reminder.notes && (
          <Text style={styles.notes}>{reminder.notes}</Text>
        )}
        
        <View style={styles.actions}>
          <TouchableOpacity 
            style={[styles.button, styles.completeButton]}
            onPress={onComplete}
          >
            <MaterialCommunityIcons name="check" size={16} color={Colors.white} />
            <Text style={styles.buttonText}>Complete</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.snoozeButton]}
            onPress={onSnooze}
          >
            <MaterialCommunityIcons name="clock-outline" size={16} color={Colors.text} />
            <Text style={[styles.buttonText, { color: Colors.text }]}>Snooze</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 6,
    flexWrap: 'wrap',
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  overdueDate: {
    color: '#FF4500',
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  notes: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  completeButton: {
    backgroundColor: Colors.primary,
  },
  snoozeButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
});