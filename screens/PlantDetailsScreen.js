import React from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const PlantDetailsScreen = ({ route, navigation }) => {
  const { plant } = route.params || {};

  // Temporary mock data (to be replaced with DB or API later)
  // Fallback mock data (used if no plant is passed)
  const plantsData = plant || {
    name: 'Snake Plant',
    scientificName: 'Dracaena trifasciata',
    family: 'Asparagaceae',
    image: require('../../assets/plants/snake_plant.jpeg'),
    features: [
      { label: 'Toxic to ingest', icon: 'warning-outline' },
      { label: "I’m easy", icon: 'leaf-outline' },
      { label: '3 years', icon: 'time-outline' },
      { label: 'Low water', icon: 'water-outline' },
      { label: 'Every 6 month', icon: 'repeat-outline' },
      { label: 'Up to 18” H', icon: 'sunny-outline' },
    ],
    benefits: [
      'Excellent air purifier that cleanses indoor air from toxins',
      'Lucky plant in Feng Shui',
      'One of the best easy-care houseplants',
      'Tolerates low light',
      'Beautiful variegated leaves with a yellow stripe',
    ],
    companions: [
      require('../../assets/plants/peace_lily.jpeg'),
      require('../../assets/plants/money_tree.jpeg'),
      require('../../assets/plants/zzplant.jpeg'),
    ],
  };

  // Handle both URI and require() image formats safely
  const getImageSource = (img) => {
    if (typeof img === 'number') return img; // require() format
    if (typeof img === 'string') return { uri: img }; // URI format
    return require('../../assets/plants/snake_plant.jpeg'); // fallback
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 🔹 Header Section */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color="#004B3A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Plant</Text>
      </View>

      {/* 🔹 Top Image */}
      <Image source={getImageSource(plantsData.image)} style={styles.mainImage} />

      {/* 🔹 About Plant Button */}
      <TouchableOpacity style={styles.aboutButton}>
        <Text style={styles.aboutText}>About Plant</Text>
      </TouchableOpacity>

      {/* 🔹 Plant Information */}
      <View style={styles.infoContainer}>
        <Text style={styles.name}>{plantsData.name}</Text>
        <Text style={styles.subText}>
          Scientific name: {plantsData.scientificName}
        </Text>
        <Text style={styles.subText}>Family: {plantsData.family}</Text>
        </View>
        
        {/* Feature Chips */}
<View style={styles.featuresContainer}>
  {(plantsData.features || []).map((item, index) => (
    <View key={index} style={styles.chip}>
      <Ionicons name={item.icon} size={16} color="#004B3A" />
      <Text style={styles.chipText}>{item.label}</Text>
    </View>
  ))}
</View>

{/* Benefits Section */}
<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Benefit</Text>
  {(plantsData.benefits || []).map((benefit, index) => (
    <Text key={index} style={styles.benefitItem}>
      • {benefit}
    </Text>
  ))}
</View>

{/* Companion Plants */}
<View style={styles.sectionContainer}>
  <Text style={styles.sectionTitle}>Companion Plant</Text>
  <View style={styles.companionRow}>
    {(plantsData.companions || []).map((img, index) => (
      <Image key={index} source={img} style={styles.companionImage} />
    ))}
  </View>
</View>
    </ScrollView>
  );
};

export default PlantDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F3E6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    justifyContent: 'space-between',
  },
  backButton: {
    backgroundColor: '#DCEFE0',
    padding: 8,
    borderRadius: 10,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#004B3A',
    fontWeight: 'bold',
    fontSize: 16,
    marginRight: 30,
  },
  mainImage: {
    width: '100%',
    height: 240,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  aboutButton: {
    alignSelf: 'center',
    backgroundColor: '#DCEFE0',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 25,
    marginVertical: 15,
  },
  aboutText: {
    fontSize: 16,
    color: '#004B3A',
    fontWeight: '600',
  },
  infoContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
  },
  subText: {
    fontSize: 14,
    color: '#555',
    marginTop: 2,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#C9E4CA',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    margin: 4,
  },
  chipText: {
    fontSize: 12,
    marginLeft: 6,
    color: '#004B3A',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 10,
    borderRadius: 15,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#004B3A',
    marginBottom: 6,
  },
  benefitItem: {
    fontSize: 13,
    color: '#004B3A',
    marginBottom: 4,
  },
  companionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  companionImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
  },
});