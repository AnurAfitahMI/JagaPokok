import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import BackButton from '../components/BackButton';
import { Colors } from '../constants/Colors';
import { db } from '../services/firebase';
import { createInitialReminders } from '../services/reminderCalculator';

export default function PlantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlantDetails();
  }, [id]);

  const fetchPlantDetails = async () => {
    try {
      console.log('Fetching plant details for ID:', id);
      
      const plantDoc = doc(db, 'plants', id);
      const plantSnapshot = await getDoc(plantDoc);
      
      if (plantSnapshot.exists()) {
        const data = plantSnapshot.data();
        console.log('Plant data:', data);
        
        setPlant({ 
          id: plantSnapshot.id, 
          ...data,
          name: data.name || 'Unknown Plant',
          description: data.description || 'No description available',
        });
      } else {
        console.log('Plant not found');
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching plant details:', error);
      setLoading(false);
    }
  };

  // Save plant to MyPokok in Firestore
  const handleAddToMyPokok = async () => {
  try {
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Error', 'You must be logged in to add plants');
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Add to MyPokok',
      `Add ${plant?.name} to your collection?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            try {
              // Create reminders based on plant data
              const reminders = createInitialReminders(plant);
              
              // Prepare plant data for MyPokok
              const plantData = {
                plantId: plant.id,
                name: plant.name,
                scientificName: plant.scientificName || '',
                imageUrl: plant.imageUrl || '',
                addedAt: new Date().toISOString(),
                
                // Include all original plant data
                ...plant,
                
                // Add reminders and care data
                reminders: reminders,
                careData: {
                  waterNeeds: plant.waterNeeds || 'Moderate',
                  repottingFrequency: plant.repottingFrequency || 'Every 1-2 years',
                  // Add any other relevant care data
                }
              };

              // Remove duplicate name field if exists
              if (plantData.plantId === plantData.id) {
                delete plantData.plantId;
              }

              // Save to Firestore under user's mypokok collection
              const mypokokRef = doc(db, 'users', userId, 'mypokok', plant.id);
              
              await setDoc(mypokokRef, plantData);

              // Show success message and navigate
              Alert.alert(
                'Success!',
                `${plant.name} has been added to MyPokok with ${reminders.length} care reminders!`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate to MyPokok screen
                      router.push('/mypokok');
                    }
                  }
                ]
              );

            } catch (error) {
              console.error('Error adding to MyPokok:', error);
              Alert.alert('Error', 'Failed to add plant. Please try again.');
            }
          }
        }
      ]
    );
  } catch (error) {
    console.error('Error in handleAddToMyPokok:', error);
    Alert.alert('Error', 'Something went wrong. Please try again.');
  }
};

  const handleCompanionPlantPress = (companionId) => {
    console.log('Navigating to companion plant:', companionId);
    router.push(`/plant-detail?id=${companionId}`);
  };

  const parseBenefits = (description) => {
    if (!description) return [];
    const benefits = description.split(/\n|•/).filter(item => item.trim().length > 0);
    return benefits.length > 0 ? benefits : [description];
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Plant not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backLink}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const benefits = parseBenefits(plant.description);

  return (
    <View style={styles.container}>
      {/* Header with Back Button, Title, MyPokok Button, and + Button */}
      <View style={styles.header}>
        <BackButton />
        
        <Text style={styles.headerTitle}>My Plant</Text>
        
        <View style={styles.headerButtons}>
          {/* MyPokok Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => router.push('/mypokok')}
          >
            <MaterialCommunityIcons name="sprout" size={30} color={Colors.primary} />
          </TouchableOpacity>

          {/* + Button */}
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={handleAddToMyPokok}
          >
            <MaterialCommunityIcons name="plus-circle" size={32} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Plant Image */}
        {plant.imageUrl ? (
          <Image 
            source={{ uri: plant.imageUrl }} 
            style={styles.plantImage}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <MaterialCommunityIcons name="flower" size={100} color={Colors.primary} />
          </View>
        )}

        {/* About Plant Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>About Plant</Text>
          </View>
          
          <Text style={styles.plantName}>{plant.name || 'Unknown Plant'}</Text>
          
          {plant.scientificName && (
            <Text style={styles.scientificNameContainer}>
  <Text style={styles.scientificNameLabel}>Scientific name: </Text>
  <Text style={styles.scientificNameValue}>{plant.scientificName}</Text>
</Text>
          )}
          
          {plant.family && (
            <Text style={styles.familyContainer}>
  <Text style={styles.familyLabel}>Family: </Text>
  <Text style={styles.familyValue}>{plant.family}</Text>
</Text>
          )}

          {/* Care Tags */}
          <View style={styles.tagsContainer}>
            {plant.toxicity && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="skull" size={16} color="#41a86b" />
                <Text style={styles.tagText}>{plant.toxicity}</Text>
              </View>
            )}
            {plant.careLevel && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="leaf" size={16} color="#41a86b" />
                <Text style={styles.tagText}>{plant.careLevel}</Text>
              </View>
            )}
            {plant.lifespan && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="calendar-heart" size={16} color="#41a86b" />
                <Text style={styles.tagText}>{plant.lifespan}</Text>
              </View>
            )}
          </View>

          <View style={styles.tagsContainer}>
            {plant.waterNeeds && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="watering-can" size={16} color="#41a86b" />
                <Text style={styles.tagText}>{plant.waterNeeds}</Text>
              </View>
            )}
            {plant.repottingFrequency && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="rotate-360" size={16} color="#41a86b" />
                <Text style={styles.tagText}>{plant.repottingFrequency}</Text>
              </View>
            )}
            {plant.maxHeight && (
              <View style={styles.tag}>
                <MaterialCommunityIcons name="ruler" size={16} color="#41a86b" />
                <Text style={styles.tagText}>{plant.maxHeight}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Benefits Section */}
        {benefits.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Benefit</Text>
            {benefits.map((benefit, index) => (
              <Text key={index} style={styles.benefitText}>
                • {benefit.trim()}
              </Text>
            ))}
          </View>
        )}

        {/* Companion Plants */}
        {plant.companionPlants && plant.companionPlants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Companion Plant</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.companionScroll}>
              {plant.companionPlants.map((companion, index) => {
                const imageUrl = companion.imageURL || companion.imageUrl || '';
                const companionId = companion.id || companion;
                
                if (!imageUrl) return null;

                return (
                  <TouchableOpacity 
                    key={index} 
                    style={styles.companionCard}
                    onPress={() => handleCompanionPlantPress(companionId)}
                    activeOpacity={0.7}
                  >
                    <Image 
                      source={{ uri: imageUrl }}
                      style={styles.companionImage}
                    />
                    {companion.name && (
                      <Text style={styles.companionName}>{companion.name}</Text>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Add to MyPokok Button */}
        <View style={styles.buttonWrapper}>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddToMyPokok}
          >
            <Text style={styles.addButtonText}>Add to MyPokok</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  errorText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 20,
  },
  backLink: {
    fontSize: 16,
    color: Colors.primary,
    textDecorationLine: 'underline',
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
    flex: 1,
    textAlign: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  headerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  plantImage: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  placeholderImage: {
    width: '100%',
    height: 400,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  section: {
    backgroundColor: Colors.white,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    backgroundColor: Colors.background,
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 15,
  },
  plantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  scientificNameContainer: { // Container - sets base font size and color
  fontSize: 14,
  color: Colors.textSecondary,
  marginBottom: 4,
  textAlign: 'center',
  },
  scientificNameLabel: { // Label - "Scientific name:" in normal font
  fontStyle: 'normal',  // ← Normal font
  },
  scientificNameValue: { // Value - the actual name in italic
  fontStyle: 'italic',  // ← Italic font
  },
  familyContainer: {
  fontSize: 14,
  color: Colors.textSecondary,
  marginBottom: 15,
  textAlign: 'center',
},
familyLabel: {
  fontStyle: 'normal',  // "Family:" in normal
},
familyValue: {
  fontStyle: 'italic',  // Family name in italic
},
  tagsContainer: { // Tag Container
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 5,
    gap: 6,
  },
  tag: { // Individual Tag
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  tagText: { // Tag Text
    fontSize: 12,
    color: Colors.text,
    marginLeft: 5,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginTop: 15,
    marginBottom: 2,
  },
  companionScroll: {
    marginTop: 10,
  },
  companionCard: {
    marginRight: 15,
    alignItems: 'center',
  },
  companionImage: {
    width: 120,
    height: 120,
    borderRadius: 15,
  },
  companionName: {
    fontSize: 12,
    color: Colors.text,
    marginTop: 5,
    textAlign: 'center',
    maxWidth: 120,
  },
  buttonWrapper: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  addButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
});
