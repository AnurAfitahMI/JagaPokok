import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  StyleSheet,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import PushNotification from 'react-native-push-notification';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { uploadPlantImage } from '../services/storageRepo';

// Firebase imports
import auth from '@react-native-firebase/auth';
import {
  listenPlants,
  addPlant,
  updatePlant as updatePlantDb,
  deletePlant as deletePlantDb,
  ensureAnonUser,
  upsertMany,
} from '../services/plantsRepo';

/** -------------------------------
 * CONSTANTS
 * ------------------------------- */
const CACHE_KEY = 'mypokok.plants.v1';
const CACHE_UID = 'mypokok.uid.v1';

/** -------------------------------
 * REQUEST EXACT ALARM PERMISSION
 * ------------------------------- */
const requestExactAlarmPermission = async () => {
  if (Platform.OS === 'android' && Platform.Version >= 31) {
    try {
      console.log('Requesting exact alarm permission...');
      const intentUrl = 'android.settings.REQUEST_SCHEDULE_EXACT_ALARM';
      const canOpen = await Linking.canOpenURL(intentUrl);

      if (canOpen) {
        await Linking.openURL(intentUrl);
      } else {
        console.warn('Direct intent not supported — opening app settings.');
        await Linking.openSettings();
      }
    } catch (error) {
      console.warn('Error requesting exact alarm permission:', error);
      await Linking.openSettings(); // fallback
    }
  }
};

/** -------------------------------
 * MAIN COMPONENT
 * ------------------------------- */
const MyPokokScreen = ({ navigation }) => {
  const [plants, setPlants] = useState([]);
  const [uid, setUid] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [selectedPlant, setSelectedPlant] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [editedStatus, setEditedStatus] = useState('');

  const [newPlantName, setNewPlantName] = useState('');
  const [newPlantStatus, setNewPlantStatus] = useState('');

  const [showPicker, setShowPicker] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);

  /** -------------------------------
   * TASK OPTIONS
   * ------------------------------- */
  const taskOptions = [
    { id: 'water', icon: 'water-outline', label: 'Water' },
    { id: 'prune', icon: 'cut-outline', label: 'Prune' },
    { id: 'rotate', icon: 'sync-outline', label: 'Rotate' },
    { id: 'fertilize', icon: 'leaf-outline', label: 'Fertilize' },
    { id: 'repot', icon: 'flower-outline', label: 'Re-pot' },
  ];

  /** -------------------------------
   * CACHE HELPERS
   * ------------------------------- */
  const loadCache = async () => {
    try {
      const raw = await AsyncStorage.getItem(CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {}
    return null;
  };

  const saveCache = async (list) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(list));
    } catch {}
  };

  /** -------------------------------
   * FIRESTORE SYNC + CACHE BOOTSTRAP
   * ------------------------------- */
  useEffect(() => {
    let unsub = null;

    (async () => {
      // Load cached plants immediately
      const cached = await loadCache();
      if (cached) {
        setPlants(cached);
      }

      // Ensure anonymous user
      let currentUid = await AsyncStorage.getItem(CACHE_UID);
      if (!currentUid) {
        try {
          currentUid = await ensureAnonUser();
          await AsyncStorage.setItem(CACHE_UID, currentUid);
        } catch (e) {
          console.warn('Anon sign-in failed, staying offline:', e);
        }
      }
      setUid(currentUid);

      // Attach Firestore listener if user available
      if (currentUid) {
        setIsOnline(true);
        unsub = listenPlants(currentUid, async (remote) => {
          setPlants(remote);
          await saveCache(remote); // keep local cache fresh
        });

        // Optional: migrate local → Firestore on first launch
        if (cached && cached.length) {
          upsertMany(currentUid, cached).catch(() => {});
        }
      }
    })();

    return () => {
      if (unsub) unsub();
    };
  }, []);

  /** -------------------------------
   * EDIT PLANT
   * ------------------------------- */
  const openEditModal = (plant) => {
    setSelectedPlant(plant);
    setEditedName(plant.name);
    setEditedStatus(plant.status);
    setModalVisible(true);
  };

  const handleSaveChanges = async () => {
    // Optimistic UI update
    setPlants((prev) => {
      const next = prev.map((p) =>
        p.id === selectedPlant.id
          ? { ...p, name: editedName, status: editedStatus }
          : p
      );
      saveCache(next);
      return next;
    });

    try {
      if (uid) {
        await updatePlantDb(uid, selectedPlant.id, {
          name: editedName,
          status: editedStatus,
        });
      }
    } catch (e) {
      console.warn('updatePlant failed, cached only:', e);
    }

    setModalVisible(false);
  };

  /** -------------------------------
   * ADD NEW PLANT
   * ------------------------------- */
  const handleAddPlant = async () => {
    if (!newPlantName.trim()) return;

    const newPlant = {
      id: Date.now().toString(), // temporary cache ID
      name: newPlantName,
      status: newPlantStatus || "I'm good!",
      statusColor: '#C5E8CD',
      icon: 'leaf-outline',
      imageUri: null,
      reminder: null,
    };

    // Optimistic UI
    setPlants((prev) => {
      const next = [{ ...newPlant }, ...prev];
      saveCache(next);
      return next;
    });

    try {
      if (uid) {
        await addPlant(uid, { ...newPlant, id: undefined });
      }
    } catch (e) {
      console.warn('addPlant failed, cached only:', e);
    }

    setAddModalVisible(false);
    setNewPlantName('');
    setNewPlantStatus('');
  };

  /** -------------------------------
   * REMINDER
   * ------------------------------- */
  const handleSetReminder = async () => {
    alert('Select reminder date and task.');
    await requestExactAlarmPermission();

    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: reminderDate,
        mode: 'date',
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            setReminderDate(selectedDate);
            setShowPicker(true);
          }
        },
      });
    }
  };

  /** -------------------------------
   * RENDER PLANT CARD
   * ------------------------------- */
  const renderPlant = ({ item }) => (
    <Swipeable
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={async () => {
  // Optimistic local remove
  const next = plants.filter((p) => p.id !== item.id);
  setPlants(next);
  saveCache(next);

  // Cloud remove (best-effort)
  try {
    if (uid) {
      await deletePlantDb(uid, item.id);
    }
  } catch (e) {
    console.warn('deletePlant failed (cached only):', e);
  }
}}

        >
          <Ionicons name="trash-outline" size={24} color="#fff" />
        </TouchableOpacity>
      )}
    >
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('PlantDetailsScreen', { plant: item })}
        activeOpacity={0.8}
      >
        <Image
          source={item.image || require('../../assets/placeholder_plant.jpg')}
          style={styles.image}
        />
        <View style={styles.textContainer}>
          <Text style={styles.plantName}>{item.name}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.statusColor || '#E8F3E6' },
            ]}
          >
            <Ionicons
              name={item.icon}
              size={16}
              color="#004B3A"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {/* 🔔 Reminder Indicator */}
        {item.reminder && (
          <View style={{ position: 'absolute', right: 40, top: 10 }}>
            <Ionicons name="notifications-outline" size={18} color="#39A96B" />
          </View>
        )}

        {/* ✏️ Edit Button */}
        <TouchableOpacity onPress={() => openEditModal(item)}>
          <Ionicons name="create-outline" size={22} color="#004B3A" />
        </TouchableOpacity>
      </TouchableOpacity>
    </Swipeable>
  );

  // 📸 Upload photo from camera or gallery
const handleUploadPhoto = async (plant, source = 'gallery') => {
  try {
    const picker =
      source === 'camera'
        ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
        : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

    if (picker.didCancel) return;

    const localUri = picker.assets?.[0]?.uri;
    if (!localUri) return;

    // Optimistic preview
    setPlants((prev) =>
      prev.map((p) => (p.id === plant.id ? { ...p, imageUri: localUri } : p))
    );

    // Upload to Firebase
    const url = await uploadPlantImage(uid, plant.id, localUri);

    // Replace with cloud URL
    setPlants((prev) =>
      prev.map((p) => (p.id === plant.id ? { ...p, imageUri: url } : p))
    );

    Alert.alert('✅ Upload complete', 'Your photo has been uploaded.');
  } catch (err) {
    console.error('Upload failed:', err);
    Alert.alert('❌ Upload failed', 'Please try again later.');
  }
};

  /** -------------------------------
   * MAIN RENDER
   * ------------------------------- */
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Pokok</Text>

      {/* Sync status badge */}
<Text
  style={{
    fontSize: 13,
    color: isOnline ? '#39A96B' : '#E57373',
    marginBottom: 10,
    textAlign: 'right',
  }}
>
  {isOnline ? '🟢 Synced with cloud' : '🟠 Offline mode'}
</Text>


      <FlatList
        data={plants}
        renderItem={renderPlant}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* ➕ Add New Plant */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setAddModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* 🌿 Edit Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Edit Plant</Text>

            <TextInput
              style={styles.input}
              placeholder="Plant name"
              value={editedName}
              onChangeText={setEditedName}
            />
            <TextInput
              style={styles.input}
              placeholder="Plant status"
              value={editedStatus}
              onChangeText={setEditedStatus}
            />

            {/* 📸 Photo Controls */}
<View style={styles.photoRow}>
  <TouchableOpacity
    style={styles.iconButton}
    onPress={() => handleUploadPhoto(selectedPlant, 'camera')}
  >
    <Ionicons name="camera-outline" size={22} color="#004B3A" />
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.iconButton}
    onPress={() => handleUploadPhoto(selectedPlant, 'gallery')}
  >
    <Ionicons name="image-outline" size={22} color="#004B3A" />
  </TouchableOpacity>

  {selectedPlant?.imageUri && (
    <Image
      source={{ uri: selectedPlant.imageUri }}
      style={styles.previewImage}
    />
  )}
</View>


            {/* 📸 Upload Photo Button */}
<View style={{ alignItems: 'center', marginVertical: 10 }}>
  <TouchableOpacity
    style={styles.uploadButton}
    onPress={() => handleUploadPhoto(selectedPlant)}
  >
    <Ionicons name="camera-outline" size={24} color="#004B3A" />
    <Text style={{ color: '#004B3A', marginLeft: 6 }}>Add Photo</Text>
  </TouchableOpacity>

  {/* Show preview if photo exists */}
  {selectedPlant?.imageUri && (
    <Image
      source={{ uri: selectedPlant.imageUri }}
      style={{ width: 120, height: 120, borderRadius: 10, marginTop: 10 }}
    />
  )}
</View>


            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#FFD166' }]}
                onPress={handleSetReminder}
              >
                <Text style={styles.modalButtonText}>Set Reminder</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E57373' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#39A96B' }]}
                onPress={handleSaveChanges}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 🌱 Add New Plant Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={addModalVisible}
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Add New Plant</Text>

            <TextInput
              style={styles.input}
              placeholder="Plant name"
              value={newPlantName}
              onChangeText={setNewPlantName}
            />
            <TextInput
              style={styles.input}
              placeholder="Status (optional)"
              value={newPlantStatus}
              onChangeText={setNewPlantStatus}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#E57373' }]}
                onPress={() => setAddModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#39A96B' }]}
                onPress={handleAddPlant}
              >
                <Text style={styles.modalButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default MyPokokScreen;

/** -------------------------------
 * STYLES
 * ------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F3E6',
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#004B3A',
    marginBottom: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 10,
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004B3A',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingVertical: 4,
    paddingHorizontal: 10,
    marginTop: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#004B3A',
  },
  fab: {
    position: 'absolute',
    bottom: 25,
    right: 25,
    backgroundColor: '#39A96B',
    borderRadius: 50,
    padding: 16,
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 25,
    borderRadius: 15,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#004B3A',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#C9E4CA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    fontSize: 14,
    color: '#004B3A',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
  },
  taskRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  taskButton: {
    backgroundColor: '#DCEFE0',
    borderRadius: 30,
    padding: 10,
  },
  deleteButton: {
    backgroundColor: '#E57373',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    borderRadius: 10,
    marginVertical: 5,
  },
  uploadButton: {
  flexDirection: 'row',
  alignItems: 'center',
  borderWidth: 1,
  borderColor: '#C9E4CA',
  borderRadius: 10,
  paddingVertical: 8,
  paddingHorizontal: 12,
  backgroundColor: '#E8F3E6',
  photoRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 10,
  gap: 10,
},
iconButton: {
  backgroundColor: '#E8F3E6',
  borderRadius: 40,
  padding: 10,
  borderWidth: 1,
  borderColor: '#C9E4CA',
},
previewImage: {
  width: 90,
  height: 90,
  borderRadius: 10,
  marginLeft: 10,
},
},
});
