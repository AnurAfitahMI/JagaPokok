import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';

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
