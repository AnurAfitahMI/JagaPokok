import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import BackButton from '../components/BackButton';
import { Colors } from '../constants/Colors';
import { db } from '../services/firebase';

export default function SearchScreen() {
  const router = useRouter();
  const [plants, setPlants] = useState([]);
  const [filteredPlants, setFilteredPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlants();
  }, []);

  const fetchPlants = async () => {
    try {
      console.log('Fetching plants from Firebase...');
      
      const plantsRef = collection(db, 'plants');
      const q = query(plantsRef, orderBy('name', 'asc'));
      const snapshot = await getDocs(q);
      
      console.log('Found', snapshot.size, 'plants');
      
      const plantsList = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unknown Plant',
          description: data.description || 'No description available',
          imageUrl: data.imageUrl || null,
          scientificName: data.scientificName || null,
          family: data.family || null,
          ...data
        };
      });
      
      console.log('Plants loaded:', plantsList.map(p => p.name));
      
      setPlants(plantsList);
      setFilteredPlants(plantsList);
      setLoading(false);
      
    } catch (error) {
      console.error('Error fetching plants:', error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (text.trim() === '') {
      setFilteredPlants(plants);
    } else {
      const filtered = plants.filter(plant => {
        const plantName = (plant.name || '').toLowerCase();
        const plantDescription = (plant.description || '').toLowerCase();
        const searchLower = text.toLowerCase();
        
        return plantName.includes(searchLower) || 
               plantDescription.includes(searchLower);
      });
      setFilteredPlants(filtered);
    }
  };

  const renderPlantCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.plantCard}
      onPress={() => router.push(`/plant-detail?id=${item.id}`)}
    >
      {item.imageUrl ? (
        <Image 
          source={{ uri: item.imageUrl }} 
          style={styles.plantImage}
        />
      ) : (
        <View style={styles.placeholderImage}>
          <MaterialCommunityIcons name="flower" size={40} color={Colors.primary} />
        </View>
      )}
      
      <View style={styles.plantInfo}>
        <Text style={styles.plantName}>{item.name}</Text>
        {item.scientificName && (
          <Text style={styles.scientificName}>{item.scientificName}</Text>
        )}
        <Text style={styles.plantDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading plants...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialCommunityIcons name="alert-circle" size={60} color="#FF5252" />
        <Text style={styles.errorText}>Failed to load plants</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchPlants}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Back Button, Search, Camera, and MyPokok Button */}
      <View style={styles.header}>
        <BackButton />
        
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons 
            name="magnify" 
            size={22} 
            color="#666" 
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Dig up a plant..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={handleSearch}
          />
        </View>

        {/* Camera Button */}
  <TouchableOpacity 
    style={styles.cameraButton}
    onPress={() => router.push('/snap')}
  >
    <MaterialCommunityIcons 
      name="camera" 
      size={32} 
      color={Colors.primary}
    />
  </TouchableOpacity>

  {/* Home Button */}
        <TouchableOpacity 
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
        >
          <MaterialCommunityIcons 
            name="home" 
            size={32} 
            color={Colors.primary}
          />
        </TouchableOpacity>

        {/* MyPokok Button - Right side */}
        <TouchableOpacity 
          style={styles.mypokokButton}
          onPress={() => router.push('/mypokok')}
        >
          <MaterialCommunityIcons 
            name="sprout" 
            size={30} 
            color={Colors.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Results Count */}
      {searchQuery.length > 0 && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsText}>
            Found {filteredPlants.length} plant{filteredPlants.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      {/* Plants List */}
      <FlatList
        data={filteredPlants}
        renderItem={renderPlantCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="flower-outline" size={60} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No plants found' : 'No plants available'}
            </Text>
            {searchQuery && (
              <Text style={styles.emptySubtext}>
                Try searching for something else
              </Text>
            )}
          </View>
        }
      />
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
  errorText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF5252',
  },
  errorSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  retryButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: Colors.background,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    paddingVertical: 10,
  },
  // MyPokok Button styling
  mypokokButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButton: {
  width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  marginRight: -10,  // Gap between camera and mypokok buttons
},
homeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: -10,
  },
  resultsContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  resultsText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  plantCard: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 15,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plantImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  plantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: 'italic',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  plantDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
  },
});
