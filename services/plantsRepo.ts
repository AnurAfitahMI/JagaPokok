// src/services/plantsRepo.ts
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

const db = firestore();

// ✅ Export db if other modules (like firebase.ts) need it
export { db };

/**
 * 🔹 Plant Data Model
 */
export type Plant = {
  id: string;
  name: string;
  status: string;
  statusColor?: string;
  icon?: string;
  imageUri?: string;        // optional image URL/path (for Firebase Storage integration later)
  reminder?: number | null; // epoch ms for reminder timestamp
  updatedAt: number;        // epoch ms for sync ordering
};

/**
 * 🔹 Firestore Collection Helper
 */
const colRef = (uid: string) => db.collection('users').doc(uid).collection('plants');

/**
 * 🔹 Ensure Anonymous Auth (for offline/temporary users)
 */
export async function ensureAnonUser(): Promise<string> {
  const cur = auth().currentUser;
  if (cur) return cur.uid;

  const res = await auth().signInAnonymously();
  return res.user.uid;
}

/**
 * 🔹 Listen to all plants (real-time Firestore listener)
 */
export function listenPlants(uid: string, onChange: (plants: Plant[]) => void) {
  return colRef(uid)
    .orderBy('updatedAt', 'desc')
    .onSnapshot((snap) => {
      const list: Plant[] = [];
      snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
      onChange(list);
    });
}

/**
 * 🔹 Add a new plant
 */
export async function addPlant(
  uid: string,
  data: Omit<Plant, 'id' | 'updatedAt'>
) {
  const now = Date.now();
  const ref = await colRef(uid).add({ ...data, updatedAt: now });
  return ref.id;
}

/**
 * 🔹 Update a plant (merge changes)
 */
export async function updatePlant(
  uid: string,
  plantId: string,
  patch: Partial<Plant>
) {
  const now = Date.now();
  await colRef(uid).doc(plantId).set({ ...patch, updatedAt: now }, { merge: true });
}

/**
 * 🔹 Delete a plant
 */
export async function deletePlant(uid: string, plantId: string) {
  await colRef(uid).doc(plantId).delete();
}

/**
 * 🔹 Bulk Upsert (for migrating local cache → Firestore)
 */
export async function upsertMany(uid: string, plants: Plant[]) {
  const batch = db.batch();
  plants.forEach((p) => {
    const ref = colRef(uid).doc(p.id || undefined);
    batch.set(ref, { ...p, updatedAt: p.updatedAt || Date.now() }, { merge: true });
  });
  await batch.commit();
}