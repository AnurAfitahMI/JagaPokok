// src/services/storageRepo.ts
import storage from '@react-native-firebase/storage';
import firestore from '@react-native-firebase/firestore';
import { updatePlant } from './plantsRepo';


/**
 * Uploads a plant image to Firebase Storage, gets its download URL,
 * and updates the Firestore plant document automatically.
 *
 * @param uid - The user ID (anonymous or authenticated)
 * @param plantId - Firestore plant document ID
 * @param localUri - The local image URI (from ImagePicker or camera)
 * @returns The download URL of the uploaded image
 */
export async function uploadPlantImage(uid: string, plantId: string, localUri: string) {
  const path = `users/${uid}/plants/${plantId}.jpg`;
  const ref = storage().ref(path);

  // Upload local file
  await ref.putFile(localUri);

  // Get public URL
  const url = await ref.getDownloadURL();

  // Update Firestore doc so UI stays in sync across devices
  await firestore()
    .collection('users').doc(uid)
    .collection('plants').doc(plantId)
    .set({ imageUri: url, updatedAt: Date.now() }, { merge: true });

  return url;
}
