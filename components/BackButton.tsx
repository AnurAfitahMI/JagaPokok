import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function BackButton() {
  const router = useRouter();

  return (
    <TouchableOpacity onPress={() => router.back()} style={{ padding: 10 }}>
  <MaterialCommunityIcons 
    name="arrow-left-circle" 
    size={32} 
    color="#41a86b" 
  />
</TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
