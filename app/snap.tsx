import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  StyleSheet,
  Text,
  View
} from 'react-native';
import BackButton from '../components/BackButton';
import { Colors } from '../constants/Colors';

export default function SnapScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <BackButton />
        <Text style={styles.headerTitle}>Plant Identification</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="camera-outline"
            size={72}
            color={Colors.primary}
          />
        </View>

        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>FUTURE DEVELOPMENT</Text>
        </View>

        <Text style={styles.title}>Plant Identification</Text>

        <Text style={styles.description}>
          Camera and gallery-based plant identification is planned for a future
          JagaPokok version.
        </Text>

        <View style={styles.featureCard}>
          <Text style={styles.featureCardTitle}>Planned features</Text>

          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="camera"
              size={22}
              color={Colors.primary}
            />
            <Text style={styles.featureText}>Camera and gallery image input</Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="leaf"
              size={22}
              color={Colors.primary}
            />
            <Text style={styles.featureText}>AI-assisted plant recognition</Text>
          </View>

          <View style={styles.featureRow}>
            <MaterialCommunityIcons
              name="book-open-outline"
              size={22}
              color={Colors.primary}
            />
            <Text style={styles.featureText}>
              Matching results with JagaPokok plant details
            </Text>
          </View>
        </View>

        <Text style={styles.releaseNote}>
          JagaPokok v1.0 focuses on plant care tracking, reminders, and community
          text posts.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
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
  },
  headerSpacer: {
    width: 44,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  iconContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    marginBottom: 20,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 14,
  },
  statusText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    color: Colors.textSecondary,
    fontSize: 16,
    lineHeight: 23,
    textAlign: 'center',
    marginBottom: 24,
  },
  featureCard: {
    width: '100%',
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 18,
    marginBottom: 22,
  },
  featureCardTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  featureText: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
    lineHeight: 21,
    marginLeft: 12,
  },
  releaseNote: {
    color: Colors.textSecondary,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
  },
});
