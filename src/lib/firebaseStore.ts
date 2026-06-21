import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { User, SchoolConfig } from '../types';

// Initialize Firebase gracefully
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

// Error handling based on firebase-integration skill guidelines
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: localStorage.getItem('ppdb_active_user') ? JSON.parse(localStorage.getItem('ppdb_active_user')!).id : null,
      email: localStorage.getItem('ppdb_active_user') ? JSON.parse(localStorage.getItem('ppdb_active_user')!).email : null,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Sync a single user record to Firestore.
 */
export async function syncUserToFirestore(user: User): Promise<void> {
  const docPath = `users/${user.id}`;
  try {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, user, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Delete a user record from Firestore.
 */
export async function deleteUserFromFirestore(userId: string): Promise<void> {
  const docPath = `users/${userId}`;
  try {
    const userRef = doc(db, 'users', userId);
    await deleteDoc(userRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, docPath);
  }
}

/**
 * Sync overall school configuration to Firestore.
 */
export async function syncSchoolConfigToFirestore(config: SchoolConfig): Promise<void> {
  const docPath = 'config/school_settings';
  try {
    const configRef = doc(db, 'config', 'school_settings');
    await setDoc(configRef, config, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, docPath);
  }
}

/**
 * Subscribe to the users collection in real-time.
 */
export function subscribeToUsers(onUpdate: (users: User[]) => void) {
  const path = 'users';
  return onSnapshot(
    collection(db, 'users'),
    (snapshot) => {
      const users: User[] = [];
      snapshot.forEach((doc) => {
        users.push(doc.data() as User);
      });
      onUpdate(users);
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Subscribe to the school config settings in real-time.
 */
export function subscribeToSchoolConfig(onUpdate: (config: SchoolConfig) => void) {
  const path = 'config/school_settings';
  return onSnapshot(
    doc(db, 'config', 'school_settings'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as SchoolConfig);
      }
    },
    (err) => {
      handleFirestoreError(err, OperationType.GET, path);
    }
  );
}

/**
 * Bootstrap the seed data to Firestore if it is empty.
 */
export async function bootstrapSeedDataIfEmpty(defaultUsers: User[], defaultSchoolConfig: SchoolConfig): Promise<void> {
  try {
    // Check if configuration exists
    const configRef = doc(db, 'config', 'school_settings');
    const usersSnap = await getDocs(collection(db, 'users'));
    
    // Seed users if collection is empty
    if (usersSnap.empty) {
      console.log('Seeding initial users to Firestore...');
      for (const u of defaultUsers) {
        await setDoc(doc(db, 'users', u.id), u);
      }
    }

    // Seed config if not exists
    await setDoc(configRef, defaultSchoolConfig, { merge: false });
  } catch (err) {
    console.warn('Bootstrap Firestore seed skipped or unneeded:', err);
  }
}
