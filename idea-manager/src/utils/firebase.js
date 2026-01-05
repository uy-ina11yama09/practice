import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

let app = null;
let db = null;
let auth = null;

// Initialize Firebase with config from localStorage
export const initializeFirebase = (config) => {
  if (!config || !config.apiKey || !config.projectId) {
    return null;
  }

  try {
    // Check if already initialized
    if (getApps().length > 0) {
      app = getApps()[0];
    } else {
      app = initializeApp(config);
    }
    db = getFirestore(app);
    auth = getAuth(app);
    return { app, db, auth };
  } catch (error) {
    console.error('Firebase initialization error:', error);
    return null;
  }
};

// Get current Firebase instances
export const getFirebaseInstances = () => ({ app, db, auth });

// Anonymous sign in
export const signInAnonymouslyToFirebase = async () => {
  if (!auth) return null;
  try {
    const result = await signInAnonymously(auth);
    return result.user;
  } catch (error) {
    console.error('Anonymous sign in error:', error);
    return null;
  }
};

// Listen to auth state
export const onAuthChange = (callback) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// Get current user
export const getCurrentUser = () => {
  return auth?.currentUser || null;
};

// Firestore operations for Ideas
export const firestoreIdeas = {
  // Get all ideas for a user
  getAll: async (userId) => {
    if (!db || !userId) return [];
    try {
      const ideasRef = collection(db, 'users', userId, 'ideas');
      const q = query(ideasRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting ideas:', error);
      return [];
    }
  },

  // Subscribe to ideas (real-time)
  subscribe: (userId, callback) => {
    if (!db || !userId) return () => {};
    const ideasRef = collection(db, 'users', userId, 'ideas');
    const q = query(ideasRef, orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
      const ideas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(ideas);
    }, (error) => {
      console.error('Ideas subscription error:', error);
    });
  },

  // Add a new idea
  add: async (userId, idea) => {
    if (!db || !userId) return null;
    try {
      const ideasRef = collection(db, 'users', userId, 'ideas');
      const docRef = doc(ideasRef, idea.id);
      await setDoc(docRef, idea);
      return idea;
    } catch (error) {
      console.error('Error adding idea:', error);
      return null;
    }
  },

  // Update an idea
  update: async (userId, ideaId, updates) => {
    if (!db || !userId) return false;
    try {
      const docRef = doc(db, 'users', userId, 'ideas', ideaId);
      await updateDoc(docRef, updates);
      return true;
    } catch (error) {
      console.error('Error updating idea:', error);
      return false;
    }
  },

  // Delete an idea
  delete: async (userId, ideaId) => {
    if (!db || !userId) return false;
    try {
      const docRef = doc(db, 'users', userId, 'ideas', ideaId);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting idea:', error);
      return false;
    }
  },
};

// Firestore operations for Tags
export const firestoreTags = {
  // Get tags for a user
  get: async (userId) => {
    if (!db || !userId) return [];
    try {
      const docRef = doc(db, 'users', userId, 'metadata', 'tags');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().list || [];
      }
      return [];
    } catch (error) {
      console.error('Error getting tags:', error);
      return [];
    }
  },

  // Subscribe to tags (real-time)
  subscribe: (userId, callback) => {
    if (!db || !userId) return () => {};
    const docRef = doc(db, 'users', userId, 'metadata', 'tags');
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data().list || []);
      } else {
        callback([]);
      }
    }, (error) => {
      console.error('Tags subscription error:', error);
    });
  },

  // Save tags
  save: async (userId, tags) => {
    if (!db || !userId) return false;
    try {
      const docRef = doc(db, 'users', userId, 'metadata', 'tags');
      await setDoc(docRef, { list: tags, updatedAt: new Date().toISOString() });
      return true;
    } catch (error) {
      console.error('Error saving tags:', error);
      return false;
    }
  },
};

// Firebase config storage
const FIREBASE_CONFIG_KEY = 'idea-manager-firebase-config';

export const getFirebaseConfig = () => {
  const data = localStorage.getItem(FIREBASE_CONFIG_KEY);
  return data ? JSON.parse(data) : null;
};

export const saveFirebaseConfig = (config) => {
  localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
};

export const clearFirebaseConfig = () => {
  localStorage.removeItem(FIREBASE_CONFIG_KEY);
};

// Check if Firebase is configured
export const isFirebaseConfigured = () => {
  const config = getFirebaseConfig();
  return config && config.apiKey && config.projectId;
};
