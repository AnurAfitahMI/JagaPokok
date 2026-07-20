import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useRouter } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BackButton from '../components/BackButton';
import { Colors } from '../constants/Colors';
import { auth, db } from '../services/firebase';
import { calculateNextDate, calculateReminderFrequencies } from '../services/reminderCalculator';

// Get icon based on reminder type
  const getReminderIcon = (reminder) => {
    const iconMap = {
      'watering': 'water',
      'fertilizing': 'sprout',
      'pruning': 'scissors-cutting',
      'repotting': 'pot-mix',
      'checkup': 'stethoscope',
      'rotate': 'rotate-right',
      'default': 'bell-alert',
    };
    if (!reminder || !reminder.type) {
      return iconMap['default'];
    }
    return iconMap[reminder.type] || iconMap['default'];
  };

// Custom ExpandablePlantCard with integrated reminders
const ExpandablePlantCard = ({ plant, urgentReminders, onPress, onDelete, onCompleteReminder, onSnoozeReminder }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  // Format date for display
  const formatReminderDate = (reminder) => {
    const today = new Date();
    const nextDate = new Date(reminder.nextDate);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (reminder.isOverdue) return 'Overdue';
    if (reminder.isToday) return 'Today';
    if (reminder.isTomorrow) return 'Tomorrow';
    
    // For dates more than 2 days away, show short date
    return nextDate.toLocaleDateString('en-MY', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  

  return (
    <TouchableOpacity 
      style={[
        styles.plantCard,
        expanded && styles.plantCardExpanded,
        urgentReminders.length > 0 && styles.plantCardWithReminders
      ]}
      activeOpacity={0.7}
      onPress={toggleExpand}
    >
      <View style={styles.plantCardContent}>
        {/* Plant info row */}
        <View style={styles.plantInfoRow}>
          <View style={styles.plantImageContainer}>
            {plant.imageUrl ? (
              <Image 
                source={{ uri: plant.imageUrl }} 
                style={styles.plantImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <MaterialCommunityIcons name="flower" size={32} color={Colors.primary} />
              </View>
            )}
          </View>
          
          <View style={styles.plantDetails}>
            <Text style={styles.plantName}>{plant.name}</Text>
            {plant.scientificName && (
              <Text style={styles.scientificName}>{plant.scientificName}</Text>
            )}
            {plant.addedAt && (
              <Text style={styles.addedDate}>
                Added: {new Date(plant.addedAt).toLocaleDateString()}
              </Text>
            )}
          </View>
          
          <View style={styles.plantActions}>
  {urgentReminders.length > 0 && (
    <View style={[
      styles.reminderIndicator,
      urgentReminders.some(r => r.isOverdue) && styles.reminderIndicatorUrgent,
      urgentReminders.some(r => r.isToday) && styles.reminderIndicatorToday
    ]}>
      <MaterialCommunityIcons 
        name={urgentReminders.some(r => r.isOverdue) ? "alert-circle" : "bell-alert"} 
        size={16} 
        color={urgentReminders.some(r => r.isOverdue) ? Colors.error : Colors.primary} 
      />
      <Text style={[
        styles.reminderCount,
        urgentReminders.some(r => r.isOverdue) && styles.reminderCountUrgent
      ]}>
        {urgentReminders.length}
      </Text>
    </View>
  )}
  <MaterialCommunityIcons 
    name={expanded ? "chevron-up" : "chevron-down"} 
    size={24} 
    color={Colors.textSecondary} 
  />
</View>
</View>

        {/* Urgent reminders - Always visible (compact) */}
        {urgentReminders.length > 0 && (
          <View style={styles.urgentRemindersCompact}>
            {urgentReminders.map((reminder) => (
              <TouchableOpacity
                key={reminder.id}
                style={[
                  styles.reminderCompactItem,
                  reminder.isOverdue && styles.reminderOverdue,
                  reminder.isToday && styles.reminderToday
                ]}
                onPress={() => onCompleteReminder && onCompleteReminder(reminder.id)}
                activeOpacity={0.6}
              >
                <MaterialCommunityIcons 
                  name={getReminderIcon(reminder)} 
                  size={14} 
                  color={reminder.isOverdue ? Colors.error : Colors.primary} 
                />
                <Text style={styles.reminderDateCompact}>
                  {formatReminderDate(reminder)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Expanded content */}
        {expanded && (
          <View style={styles.expandedContent}>
            {/* Care information */}
            {plant.careData && (
              <View style={styles.careInfo}>
                <Text style={styles.careTitle}>Care Guide</Text>
                <View style={styles.careItem}>
                  <MaterialCommunityIcons name="water" size={16} color={Colors.primary} />
                  <Text style={styles.careText}>
                    Water: {plant.careData.waterNeeds || 'Moderate'}
                  </Text>
                </View>
                <View style={styles.careItem}>
                  <MaterialCommunityIcons name="sun-thermometer" size={16} color="#FF9800" />
                  <Text style={styles.careText}>
                    Light: {plant.careData.sunlight || 'Bright indirect'}
                  </Text>
                </View>
              </View>
            )}

            {/* Action buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={[styles.actionButton, styles.viewButton]}
                onPress={onPress}
              >
                <MaterialCommunityIcons name="eye" size={20} color={Colors.primary} />
                <Text style={styles.viewButtonText}>View Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.actionButton, styles.deleteButton]}
                onPress={onDelete}
              >
                <MaterialCommunityIcons name="trash-can-outline" size={20} color={Colors.primary} />
                <Text style={styles.deleteButtonText}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function MyPokokScreen() {
  const router = useRouter();
  const [myPlants, setMyPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [plantToDelete, setPlantToDelete] = useState(null);
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const fadeAnim = useState(new Animated.Value(0))[0];
  
  // Stats state
  const [stats, setStats] = useState({
    totalPlants: 0,
    upcomingTasks: 0,
    urgentTasks: 0,
    achievements: 0,
  });

  useEffect(() => {
    fetchMyPlants();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchMyPlants();
      
      // Cleanup if needed
      return () => {
        // Cleanup code here
      };
    }, [])
  );

  const fetchMyPlants = async () => {
    try {
      setError(null);
      const userId = await AsyncStorage.getItem('userId');
if (!userId) {
  console.log('No user found');
  setMyPlants([]);
  setLoading(false);
  return;
}

      const mypokokRef = collection(db, 'users', userId, 'mypokok');
      const q = query(mypokokRef, orderBy('addedAt', 'desc'));
      const snapshot = await getDocs(q);
    
      const plantsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          // Ensure reminders array exists
          reminders: data.reminders || [],
          // Ensure careData exists for backward compatibility
          careData: data.careData || {
            waterNeeds: data.waterNeeds || 'Moderate',
            repottingFrequency: data.repottingFrequency || 'Every 1-2 years',
          }
        };
      });

      setMyPlants(plantsList);
      calculateStats(plantsList);
      setLoading(false);
      setRefreshing(false);
      
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

    } catch (error) {
      console.error('Error fetching MyPokok plants:', error);
      setError('Failed to load plants. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Get urgent reminders for a specific plant (1-2 most urgent)
  const getUrgentRemindersForPlant = (plant) => {
    if (!plant.reminders || !Array.isArray(plant.reminders)) {
      return [];
    }

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Filter enabled reminders and sort by urgency
    const urgentReminders = plant.reminders
      .filter(reminder => reminder.isEnabled)
      .map(reminder => {
        const nextDate = new Date(reminder.nextDate);
        const isOverdue = nextDate < today;
        const isToday = nextDate.toDateString() === today.toDateString();
        const isTomorrow = nextDate.toDateString() === tomorrow.toDateString();
        const isWithin3Days = nextDate <= threeDaysFromNow;
        
        // Calculate urgency score (lower = more urgent)
        let urgencyScore = 0;
        if (isOverdue) urgencyScore = 1;
        else if (isToday) urgencyScore = 2;
        else if (isTomorrow) urgencyScore = 3;
        else if (isWithin3Days) urgencyScore = 4;
        else urgencyScore = 5;

        return {
          ...reminder,
          urgencyScore,
          isOverdue,
          isToday,
          isTomorrow,
          isWithin3Days
        };
      })
      .sort((a, b) => {
        // Sort by urgency score, then by date
        if (a.urgencyScore !== b.urgencyScore) {
          return a.urgencyScore - b.urgencyScore;
        }
        return new Date(a.nextDate) - new Date(b.nextDate);
      })
      .slice(0, 2); // Take only 1-2 most urgent reminders

    return urgentReminders;
  };

  const calculateStats = (plants) => {
    let totalPlants = plants.length;
    let upcomingTasks = 0;
    let urgentTasks = 0;
    let achievements = 0;

    // Calculate tasks
    plants.forEach(plant => {
      if (plant.reminders && Array.isArray(plant.reminders)) {
        plant.reminders.forEach(reminder => {
          if (reminder.isEnabled) {
            const nextDate = new Date(reminder.nextDate);
            const today = new Date();
            const threeDaysFromNow = new Date(today);
            threeDaysFromNow.setDate(today.getDate() + 3);
            
            if (nextDate <= threeDaysFromNow) {
              upcomingTasks++;
              
              // Check if overdue or within 24 hours
              const isOverdue = nextDate < today;
              const isWithin24Hours = (nextDate - today) <= (24 * 60 * 60 * 1000);
              
              if (isOverdue || isWithin24Hours || reminder.priority === 'high') {
                urgentTasks++;
              }
            }
          }
        });
      }
    });

    // Calculate achievements
    if (totalPlants >= 20) achievements = 3;
    else if (totalPlants >= 10) achievements = 2;
    else if (totalPlants >= 5) achievements = 1;

    setStats({
      totalPlants,
      upcomingTasks,
      urgentTasks,
      achievements,
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyPlants();
  };

  // Plant Removal Functionality
  const handleDeletePress = (plant) => {
    setPlantToDelete(plant);
    setDeleteModalVisible(true);
  };

  const confirmDeletePlant = async () => {
  if (!plantToDelete) return;
  
  try {
    // Get userId from AsyncStorage (same as fetchMyPlants)
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Error', 'User not found. Please log in again.');
      return;
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'users', userId, 'mypokok', plantToDelete.id));
    
    // Update local state immediately
    const updatedPlants = myPlants.filter(plant => plant.id !== plantToDelete.id);
    setMyPlants(updatedPlants);
    
    // Recalculate stats with updated plants
    calculateStats(updatedPlants);
    
    Alert.alert('Success', `${plantToDelete.name} has been removed from MyPokok!`);
    
  } catch (error) {
    console.error('Error deleting plant:', error);
    Alert.alert('Error', 'Failed to delete plant. Please try again.');
  } finally {
    setDeleteModalVisible(false);
    setPlantToDelete(null);
  }
};

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setPlantToDelete(null);
  };

  // Reminder Functions
  const handleReminderPress = (reminder, plant) => {
    setSelectedReminder(reminder);
    setSelectedPlant(plant);
    setReminderModalVisible(true);
  };

  const handleCompleteReminder = async () => {
    if (!selectedReminder || !selectedPlant) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Calculate new next date
      const frequencies = calculateReminderFrequencies(selectedPlant);
      const frequencyDays = selectedReminder.frequencyDays || frequencies[selectedReminder.type] || 7;
      const newNextDate = calculateNextDate(new Date().toISOString(), frequencyDays);

      // Update reminder in Firestore
      const plantRef = doc(db, 'users', user.uid, 'mypokok', selectedPlant.id);
      const updatedReminders = selectedPlant.reminders.map(reminder => 
        reminder.id === selectedReminder.id 
          ? { 
              ...reminder, 
              lastCompleted: new Date().toISOString(),
              nextDate: newNextDate 
            }
          : reminder
      );

      await updateDoc(plantRef, {
        reminders: updatedReminders
      });

      // Update local state
      const updatedPlants = myPlants.map(plant =>
        plant.id === selectedPlant.id
          ? { ...plant, reminders: updatedReminders }
          : plant
      );

      setMyPlants(updatedPlants);
      calculateStats(updatedPlants);

      Alert.alert('Task Completed', 'Reminder has been rescheduled!');
      setReminderModalVisible(false);
      setSelectedReminder(null);
      setSelectedPlant(null);

    } catch (error) {
      console.error('Error completing reminder:', error);
      Alert.alert('Error', 'Failed to complete reminder. Please try again.');
    }
  };

  const handleSnoozeReminder = async (hours = 24) => {
    if (!selectedReminder || !selectedPlant) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      // Snooze from the scheduled date, or from now if the reminder is overdue
      const existingNextDate = new Date(selectedReminder.nextDate);
      const now = new Date();
      const snoozeFrom = existingNextDate > now ? existingNextDate : now;
      const newDate = new Date(snoozeFrom);
      newDate.setHours(newDate.getHours() + hours);
      const newNextDate = newDate.toISOString();

      // Update reminder in Firestore
      const plantRef = doc(db, 'users', user.uid, 'mypokok', selectedPlant.id);
      const updatedReminders = selectedPlant.reminders.map(reminder => 
        reminder.id === selectedReminder.id 
          ? { ...reminder, nextDate: newNextDate }
          : reminder
      );

      await updateDoc(plantRef, {
        reminders: updatedReminders
      });

      // Update local state
      const updatedPlants = myPlants.map(plant =>
        plant.id === selectedPlant.id
          ? { ...plant, reminders: updatedReminders }
          : plant
      );

      setMyPlants(updatedPlants);
      calculateStats(updatedPlants);

      Alert.alert('Reminder Snoozed', `Reminder has been snoozed for ${hours} hours.`);
      setReminderModalVisible(false);
      setSelectedReminder(null);
      setSelectedPlant(null);

    } catch (error) {
      console.error('Error snoozing reminder:', error);
      Alert.alert('Error', 'Failed to snooze reminder. Please try again.');
    }
  };

  // Loading Skeleton Component
  const renderSkeleton = () => (
    <View style={styles.skeletonCard}>
      <View style={[styles.skeletonImage, styles.shimmer]} />
      <View style={styles.skeletonInfo}>
        <View style={[styles.skeletonText, styles.shimmer, { width: '70%' }]} />
        <View style={[styles.skeletonText, styles.shimmer, { width: '50%', marginTop: 8 }]} />
        <View style={[styles.skeletonText, styles.shimmer, { width: '40%', marginTop: 4 }]} />
      </View>
      <View style={[styles.skeletonIcon, styles.shimmer]} />
    </View>
  );

  // Render Plant Card
  const renderPlantCard = ({ item }) => {
    const urgentReminders = getUrgentRemindersForPlant(item);
    
    return (
      <ExpandablePlantCard
        plant={item}
        urgentReminders={urgentReminders}
        onPress={() => router.push(`/plant-detail?id=${item.plantId || item.id}`)}
        onDelete={() => handleDeletePress(item)}
        onCompleteReminder={(reminderId) => {
          const reminder = item.reminders?.find(r => r.id === reminderId);
          if (reminder) {
            handleReminderPress(reminder, item);
          }
        }}
      />
    );
  };

  // Stats Carousel Component
  const renderStatsCarousel = () => {
    const statItems = [
      {
        id: 'total',
        title: 'Total Plants',
        value: stats.totalPlants.toString(),
        icon: 'flower',
        color: Colors.primary,
      },
      {
        id: 'upcoming',
        title: 'Upcoming Tasks',
        value: stats.upcomingTasks.toString(),
        icon: 'calendar-clock',
        color: '#FF9800',
      },
      {
        id: 'urgent',
        title: 'Urgent Tasks',
        value: stats.urgentTasks.toString(),
        icon: 'alert',
        color: '#FF4500',
      },
      {
        id: 'achievements',
        title: 'Achievements',
        value: stats.achievements.toString(),
        icon: 'trophy',
        color: '#9C27B0',
      },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.statsCarousel}
      >
        {statItems.map((stat, index) => (
          <View key={stat.id} style={[
            styles.statBox,
            { backgroundColor: stat.color + '45' }
          ]}>
            <View style={styles.statIconContainer}>
              <MaterialCommunityIcons 
                name={stat.icon} 
                size={24} 
                color={stat.color} 
              />
            </View>
            <Text style={[styles.statNumber, { color: stat.color }]}>
              {stat.value}
            </Text>
            <Text style={styles.statLabel}>{stat.title}</Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  // Loading State
  if (loading && myPlants.length === 0) {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>MyPokok</Text>
          <View style={{ width: 70 }} />
        </View>

        {/* Skeleton Loading */}
        <View style={styles.skeletonContainer}>
          <View style={styles.skeletonStats}>
            <View style={[styles.skeletonStatBox, styles.shimmer]} />
          </View>
          
          <FlatList
            data={[1, 2, 3]}
            renderItem={renderSkeleton}
            keyExtractor={(item) => item.toString()}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </View>
    );
  }

  // Error State
  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton />
          <Text style={styles.headerTitle}>MyPokok</Text>
          <View style={{ width: 70 }} />
        </View>
        
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle-outline" size={80} color={Colors.error} />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchMyPlants}
          >
            <MaterialCommunityIcons name="refresh" size={20} color={Colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>MyPokok</Text>
        
        {/* Home Button - NEW */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <MaterialCommunityIcons name="home" size={36} color={Colors.primary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/search')}>
          <MaterialCommunityIcons name="plus-circle" size={32} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Plants List or Empty State */}
      {myPlants.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="flower-outline" size={80} color="#ccc" />
          <Text style={styles.emptyTitle}>No Plants Yet</Text>
          <Text style={styles.emptyText}>
            Start building your plant collection!
          </Text>
          <TouchableOpacity 
            style={styles.addPlantButton}
            onPress={() => router.push('/search')}
          >
            <MaterialCommunityIcons name="plus" size={20} color={Colors.white} />
            <Text style={styles.addPlantButtonText}>Add Your First Plant</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          ListHeaderComponent={
            <>
              {/* Stats Carousel */}
              {renderStatsCarousel()}
              
              {/* My Plants Section */}
              <View style={styles.plantsSection}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>My Plants ({myPlants.length})</Text>
                  {stats.upcomingTasks > 0 && (
                    <View style={styles.tasksBadge}>
                      <MaterialCommunityIcons name="bell" size={14} color={Colors.white} />
                      <Text style={styles.tasksBadgeText}>{stats.upcomingTasks}</Text>
                    </View>
                  )}
                </View>
              </View>
            </>
          }
          data={myPlants}
          renderItem={renderPlantCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[Colors.primary]}
            />
          }
        />
      )}

      {/* Delete Confirmation Modal */}
      <Modal
  visible={deleteModalVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setDeleteModalVisible(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setDeleteModalVisible(false)}
  >
    <TouchableOpacity 
      activeOpacity={1}
      onPress={(e) => e.stopPropagation()}
    >
      <View style={styles.modalContainer}>
        {/* Header with Icon and Title side by side */}
        <View style={styles.modalHeaderRow}>
          <MaterialCommunityIcons 
            name="alert-circle" 
            size={48} 
            color={Colors.error} 
          />
          <Text style={styles.modalTitleLeft}>Remove Plant</Text>
        </View>
        
        <Text style={styles.modalText}>
          Are you sure you want to remove "{plantToDelete?.name}" from your collection?
        </Text>

        {/* FIXED: Changed from modalButtonSmall to modalButtons for the container */}
        <View style={styles.modalButtons}>
          <TouchableOpacity 
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => setDeleteModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.modalButton, styles.deleteButtonModal]}
            onPress={confirmDeletePlant}
          >
            <MaterialCommunityIcons name="trash-can-outline" size={18} color={Colors.white} />
            <Text style={styles.deleteButtonModalText}>Remove</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  </TouchableOpacity>
</Modal>

      {/* Reminder Action Modal */}
      <Modal
  animationType="fade"
  transparent={true}
  visible={reminderModalVisible}
  onRequestClose={() => setReminderModalVisible(false)}
>
  <View style={styles.modalOverlay}>
    <View style={styles.modalContainer}>
      {/* Icon + Title - Left aligned */}
      <View style={styles.modalHeaderRow}>
        <MaterialCommunityIcons 
          name={getReminderIcon(selectedReminder)} 
          size={40} 
          color={Colors.primary} 
        />
        <Text style={styles.modalTitleLeft}>
          {selectedReminder?.title || 'Reminder'}
        </Text>
      </View>

      {/* Tips */}
      <Text style={styles.modalText}>
        {selectedReminder?.notes || 'Complete this task to reschedule it.'}
      </Text>

      {/* Action Buttons - Smaller */}
      <View style={styles.modalButtonsCompact}>
        <TouchableOpacity 
          style={[styles.modalButtonSmall, styles.cancelButtonSmall]}
          onPress={() => setReminderModalVisible(false)}
        >
          <Text style={styles.cancelButtonTextSmall}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.modalButtonSmall, styles.completeButtonSmall]}
          onPress={handleCompleteReminder}
        >
          <Text style={styles.completeButtonTextSmall}>Complete Task</Text>
        </TouchableOpacity>
      </View>

      {/* Snooze Button */}
      <TouchableOpacity 
        style={styles.snoozeButton}
        onPress={() => handleSnoozeReminder(24)}
      >
        <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.text} />
        <Text style={styles.snoozeButtonText}>Snooze for 24 hours</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    paddingHorizontal: 60,
  },
  homeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10, // Add some spacing between home and plus buttons
  },
  // Stats Carousel
  statsCarousel: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    gap: 15,
  },
  statBox: {
    width: 140,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Sections
  plantsSection: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  tasksBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  tasksBadgeText: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  
  // Plant Card Styles
  plantCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  plantCardExpanded: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  plantCardWithReminders: {
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  plantCardContent: {
    flex: 1,
  },
  plantInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plantImageContainer: {
    marginRight: 12,
    width: 60,
    height: 60,
  },
  plantImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
  },
  placeholderImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: Colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantDetails: {
    flex: 1,
    marginRight: 8,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 2,
  },
  scientificName: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  addedDate: {
    fontSize: 11,
    color: Colors.textLight,
  },
  plantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reminderIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 2,
  },
  reminderIndicatorUrgent: {
  backgroundColor: '#FFEBEE', // Light red for urgent/overdue
},
reminderIndicatorToday: {
  backgroundColor: '#FFF3E0', // Light orange for today
},
  reminderCount: {
    fontSize: 10,
    color: Colors.error,
    fontWeight: 'bold',
  },
  reminderCountUrgent: {
  color: Colors.error,
},
  // Urgent Reminders Compact
  urgentRemindersCompact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 8,
    marginLeft: 72,
  },
  reminderCompactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  reminderOverdue: {
    backgroundColor: '#FFEBEE',
    borderColor: Colors.error,
  },
  reminderToday: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  reminderDateCompact: {
    fontSize: 11,
    color: Colors.text,
    fontWeight: '500',
  },
  
  // Expanded Content
  expandedContent: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  careInfo: {
    marginBottom: 16,
  },
  careTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  careItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  careText: {
    fontSize: 13,
    color: Colors.text,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  viewButton: {
    backgroundColor: Colors.background,
  },
  viewButtonText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  deleteButton: {
    backgroundColor: Colors.background,
  },
  deleteButtonText: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: '500',
  },
  
  // List container
  listContainer: {
    paddingBottom: 20,
  },
  
  // Loading skeleton styles
  skeletonContainer: {
    flex: 1,
  },
  skeletonStats: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
  },
  skeletonStatBox: {
    width: 100,
    height: 80,
    borderRadius: 15,
    backgroundColor: '#E0E0E0',
  },
  skeletonCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 12,
    alignItems: 'center',
  },
  skeletonImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: '#E0E0E0',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonText: {
    height: 16,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
  },
  skeletonIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
  },
  shimmer: {
    overflow: 'hidden',
    position: 'relative',
  },
  
  // Error state
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.error,
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
    gap: 8,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Empty state
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  addPlantButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    alignItems: 'center',
  },
  addPlantButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 25,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeaderRow: {
  flexDirection: 'row',
  alignItems: 'center',
  marginBottom: 16,
  gap: 16,
},
modalTitleLeft: {
  fontSize: 24,
  fontWeight: 'bold',
  color: Colors.text,
  flex: 1,
},
modalText: {
  fontSize: 15,
  color: Colors.textSecondary,
  lineHeight: 22,
  marginBottom: 24,
},
  modalButtonsCompact: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 15,
},
modalButtonSmall: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 14,
  borderRadius: 12,
  gap: 8,
},
// Add this to your StyleSheet (around line 800-850):
modalButtons: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  gap: 15,
  marginTop: 10,
},
modalButton: {
  flex: 1,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  paddingVertical: 14,
  borderRadius: 12,
  gap: 8,
},
cancelButton: {
  backgroundColor: Colors.background,
  borderWidth: 1,
  borderColor: Colors.textSecondary,
},
cancelButtonText: {
  color: Colors.text,
  fontSize: 16,
  fontWeight: '600',
},
deleteButtonModal: {
  backgroundColor: Colors.error,
},
deleteButtonModalText: {
  color: Colors.white, // Changed from Colors.text to white for better visibility
  fontSize: 16,
  fontWeight: '600',
},
cancelButtonSmall: {
  backgroundColor: Colors.background,
  borderWidth: 1,
  borderColor: Colors.textSecondary,
},
cancelButtonTextSmall: {
  color: Colors.text,
  fontSize: 16,
  fontWeight: '600',
},
completeButtonSmall: {
  backgroundColor: Colors.primary,
},
completeButtonTextSmall: {
  color: Colors.white,
  fontSize: 16,
  fontWeight: '600',
},
  reminderDateText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  snoozeButton: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  paddingVertical: 12,
  paddingHorizontal: 20,
  backgroundColor: Colors.background,
  borderRadius: 10,
},
snoozeButtonText: {
  fontSize: 14,
  color: Colors.text,
  fontWeight: '500',
},
});