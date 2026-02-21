import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp, enableIndexedDbPersistence, connectFirestoreEmulator } from 'firebase/firestore';
import { firebaseConfig } from '../../firebase-config.js';

let app;
let db;
let isFirebaseEnabled = false;

export function initFirebase() {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    
    // Check if we're in development and connect to emulator if available
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Running in development mode - checking for Firebase emulator...');
      
      // Try to connect to emulator first
      try {
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('Connected to Firebase emulator');
      } catch (emulatorError) {
        console.log('Firebase emulator not available, using production Firebase');
        // Enable offline persistence for development
        enableIndexedDbPersistence(db).catch((err) => {
          console.warn('Firebase persistence failed:', err);
        });
      }
    } else {
      // Production - enable persistence with better error handling
      enableIndexedDbPersistence(db).catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn('Firebase persistence failed - multiple tabs open');
        } else if (err.code === 'unimplemented') {
          console.warn('Firebase persistence not available - browser not supported');
        } else {
          console.warn('Firebase persistence failed:', err);
        }
      });
    }
    
    isFirebaseEnabled = true;
    console.log('Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    isFirebaseEnabled = false;
    return false;
  }
}

export function isFirebaseReady() {
  return isFirebaseEnabled;
}

// Get unique device/user ID (fallback to localStorage)
function getDeviceId() {
  let deviceId = localStorage.getItem('rmc_device_id');
  if (!deviceId) {
    deviceId = 'device_' + Math.random().toString(36).substr(2, 9) + Date.now();
    localStorage.setItem('rmc_device_id', deviceId);
  }
  return deviceId;
}

// Fetch data from Firebase
export async function fetchFromFirebase() {
  if (!isFirebaseEnabled) return null;
  try {
    const deviceId = getDeviceId();
    const docRef = doc(db, 'ramadan_mission_data', deviceId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    // Handle different types of Firebase errors
    if (error.code === 'unavailable') {
      console.warn('Firebase temporarily unavailable - using local data');
    } else if (error.code === 'client-offline') {
      console.warn('Firebase client offline - check connection');
    } else if (error.code === 'permission-denied') {
      console.error('Firebase permission denied - check Firestore rules');
    } else if (error.code === 'not-found') {
      console.log('No data found in Firebase - first time user');
    } else {
      console.error('Error fetching from Firebase:', error);
    }
    return null;
  }
}

// Push data to Firebase
export async function pushToFirebase(data) {
  if (!isFirebaseEnabled) return false;
  try {
    const deviceId = getDeviceId();
    const docRef = doc(db, 'ramadan_mission_data', deviceId);
    await setDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
      deviceId,
    }, { merge: true });
    console.log('Data synced to Firebase');
    return true;
  } catch (error) {
    // Handle different types of Firebase errors
    if (error.code === 'unavailable') {
      console.warn('Firebase temporarily unavailable - data saved locally only');
    } else if (error.code === 'client-offline') {
      console.warn('Firebase client offline - data saved locally only');
    } else if (error.code === 'permission-denied') {
      console.error('Firebase permission denied - check Firestore rules');
    } else if (error.code === 'resource-exhausted') {
      console.warn('Firebase quota exceeded - try again later');
    } else {
      console.error('Error pushing to Firebase:', error);
    }
    return false;
  }
}

// Simple conflict resolution: server wins if newer, otherwise local wins
export function resolveConflict(localData, remoteData) {
  const localTime = new Date(localData.lastSync || 0).getTime();
  const remoteTime = new Date(remoteData.updatedAt?.toDate?.() || remoteData.updatedAt || 0).getTime();
  if (remoteTime > localTime) {
    return { merged: remoteData, source: 'remote' };
  }
  return { merged: localData, source: 'local' };
}
