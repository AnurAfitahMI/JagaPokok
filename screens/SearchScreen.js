import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, FlatList, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { db } from '../services/firebase';
import FastImage from 'react-native-fast-image';

const PlantItem = ({ item, navigation }) => {
  const cleanUrl = (url) => {
    if (!url) return null;
    return url
      .trim()
      .replace(/^http:/, 'https:')
      .replace(/\.JPG$/i, '.jpg')
      .replace(/ /g, '%20');
  };
  
  const safeImageUrl = cleanUrl(item.imageUrl);
  const [imgUri, setImgUri] = useState(safeImageUrl);

  return (
    <TouchableOpacity
      style={styles.plantItem}
      onPress={() =>
        navigation.navigate('PlantDetailsScreen', { plant: item })
      }
    >
      <FastImage
        style={styles.plantImage}
        source={{
          uri: imgUri,

          headers: {
          'Referer': 'https://www.google.com/', // A neutral, common Referer
        },

          priority: FastImage.priority.normal,
        }}
        cacheControl={FastImage.cacheControl.web}
        resizeMode={FastImage.resizeMode.cover}
        onError={() => {
          console.warn('🛑 Failed, fallback to placeholder:', imgUri);
          setImgUri('https://picsum.photos/200/200?blur');
        }}
        defaultSource={require('../../assets/placeholder_plant.jpg')}
      />

      <View style={{ flex: 1 }}>
        <Text style={styles.plantName}>{item.name}</Text>
        <Text style={styles.plantDesc}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

  // 🌱 Main SearchScreen Component
const SearchScreen = ({ navigation }) => {
  const [plants, setPlants] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🔍 Fetch plants from Firestore
  useEffect(() => {
    const fetchPlants = async (retryCount = 0) => {
      try {
        console.log('Fetching plants...');
        const querySnapshot = await db.collection('plants').get();
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPlants(data);
        console.log('✅ Plants fetched:', data.length);
      } catch (error) {
        console.error('❌ Error fetching plants:', error);
        if (retryCount < 3) {
          console.log(`Retrying fetch (${retryCount + 1}/3) in 3 seconds...`);
          setTimeout(() => fetchPlants(retryCount + 1), 3000);
        } else {
          console.warn('⚠️ Failed to fetch plants after 3 retries.');
        }
      }
    };

    fetchPlants();
  }, []);
  
  // 🔎 Filter logic
  const filteredPlants = plants.filter((plant) =>
    plant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Search Header */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={22}
            color="#004B3A"
            style={{ marginLeft: 15 }}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search plants"
            placeholderTextColor="#6FAF9A"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <TouchableOpacity
          style={styles.identifyButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Ionicons name="camera-outline" size={22} color="#004B3A" />
        </TouchableOpacity>
      </View>

      <Image
      source={{
        uri: 'https://picsum.photo/400/400',
      }}
      style={{ width: 100, height: 100, backgroundColor: '#ccc', margin: 10 }}
      />

      {/* FlatList */}
      <FlatList
        data={filteredPlants}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlantItem item={item} navigation={navigation} />
        )}
      />

      {/* Test Button */}
      <TouchableOpacity
        style={styles.testButton}
        onPress={() =>
          navigation.navigate('PhotoPreviewScreen', {
            photoUri: '/storage/emulated/0/Download/sample.jpg',
          })
        }
      >
        <Text style={styles.testButtonText}>Test PhotoPreview Screen</Text>
      </TouchableOpacity>

      {/* Example Image for Debug */}
      <Image
        source={{
          uri: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Areca_palm.jpg',
        }}
        style={{ width: 100, height: 100, backgroundColor: '#ccc', margin: 10 }}
      />
    </View>
  );
};

export default SearchScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#C9E4CA',
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: '#E8F3E6',
    borderRadius: 50,
    paddingVertical: 0,
    marginRight: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#004B3A',
    paddingHorizontal: 10,
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F3E6',
    borderRadius: 25,
    paddingVertical: 14,
    paddingHorizontal: 14,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  plantItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    padding: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  plantImage: {
  width: 100,
  height: 100,
  borderRadius: 10,
  marginRight: 12,
  backgroundColor: '#e0e0e0',
  },
  plantName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#004B3A',
  },
  plantDesc: {
    fontSize: 13,
    color: '#004B3A',
    marginTop: 4,
  },
  testButton: {
    backgroundColor: '#39A96B',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#DDF5E5',
    borderRadius: 12,
    padding: 10,
    marginVertical: 6,
    marginHorizontal: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
});