import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getIdeas,
  saveIdeas,
  getTags,
  saveTags,
  getSettings,
  saveSettings,
} from '../utils/storage';
import {
  initializeFirebase,
  getFirebaseConfig,
  signInAnonymouslyToFirebase,
  onAuthChange,
  firestoreIdeas,
  firestoreTags,
  isFirebaseConfigured,
} from '../utils/firebase';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [ideas, setIdeas] = useState([]);
  const [tags, setTags] = useState([]);
  const [settings, setSettingsState] = useState(getSettings());
  const [isLoading, setIsLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [useFirebase, setUseFirebase] = useState(false);
  const [firebaseStatus, setFirebaseStatus] = useState('unconfigured'); // 'unconfigured', 'connecting', 'connected', 'error'

  const unsubscribeIdeasRef = useRef(null);
  const unsubscribeTagsRef = useRef(null);

  // Initialize Firebase if configured
  useEffect(() => {
    const config = getFirebaseConfig();
    if (config && config.apiKey && config.projectId) {
      setFirebaseStatus('connecting');
      const result = initializeFirebase(config);
      if (result) {
        setUseFirebase(true);

        // Listen to auth state
        const unsubAuth = onAuthChange(async (user) => {
          if (user) {
            setFirebaseUser(user);
            setFirebaseStatus('connected');
          } else {
            // Sign in anonymously
            const newUser = await signInAnonymouslyToFirebase();
            if (newUser) {
              setFirebaseUser(newUser);
              setFirebaseStatus('connected');
            } else {
              setFirebaseStatus('error');
              setUseFirebase(false);
            }
          }
        });

        return () => unsubAuth();
      } else {
        setFirebaseStatus('error');
      }
    } else {
      // No Firebase config, use localStorage
      setIdeas(getIdeas());
      setTags(getTags());
      setIsLoading(false);
    }
  }, []);

  // Subscribe to Firestore data when user is authenticated
  useEffect(() => {
    if (useFirebase && firebaseUser) {
      // Subscribe to ideas
      unsubscribeIdeasRef.current = firestoreIdeas.subscribe(
        firebaseUser.uid,
        (firestoreIdeas) => {
          setIdeas(firestoreIdeas);
          setIsLoading(false);
        }
      );

      // Subscribe to tags
      unsubscribeTagsRef.current = firestoreTags.subscribe(
        firebaseUser.uid,
        (firestoreTags) => {
          setTags(firestoreTags);
        }
      );

      return () => {
        if (unsubscribeIdeasRef.current) unsubscribeIdeasRef.current();
        if (unsubscribeTagsRef.current) unsubscribeTagsRef.current();
      };
    }
  }, [useFirebase, firebaseUser]);

  // Save ideas when changed (localStorage only)
  useEffect(() => {
    if (!isLoading && !useFirebase) {
      saveIdeas(ideas);
    }
  }, [ideas, isLoading, useFirebase]);

  // Save tags when changed (localStorage only)
  useEffect(() => {
    if (!isLoading && !useFirebase) {
      saveTags(tags);
    }
  }, [tags, isLoading, useFirebase]);

  // Add a new idea
  const addIdea = useCallback(async (ideaData) => {
    const newIdea = {
      id: uuidv4(),
      content: ideaData.content,
      title: ideaData.title || '',
      tags: ideaData.tags || [],
      feedback: ideaData.feedback || '',
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (useFirebase && firebaseUser) {
      await firestoreIdeas.add(firebaseUser.uid, newIdea);
    } else {
      setIdeas(prev => [newIdea, ...prev]);
    }

    return newIdea;
  }, [useFirebase, firebaseUser]);

  // Update an idea
  const updateIdea = useCallback(async (id, updates) => {
    const updatedData = { ...updates, updatedAt: new Date().toISOString() };

    if (useFirebase && firebaseUser) {
      await firestoreIdeas.update(firebaseUser.uid, id, updatedData);
    } else {
      setIdeas(prev =>
        prev.map(idea =>
          idea.id === id ? { ...idea, ...updatedData } : idea
        )
      );
    }
  }, [useFirebase, firebaseUser]);

  // Delete an idea
  const deleteIdea = useCallback(async (id) => {
    if (useFirebase && firebaseUser) {
      await firestoreIdeas.delete(firebaseUser.uid, id);
    } else {
      setIdeas(prev => prev.filter(idea => idea.id !== id));
    }
  }, [useFirebase, firebaseUser]);

  // Toggle favorite
  const toggleFavorite = useCallback(async (id) => {
    const idea = ideas.find(i => i.id === id);
    if (!idea) return;

    const updates = { isFavorite: !idea.isFavorite };

    if (useFirebase && firebaseUser) {
      await firestoreIdeas.update(firebaseUser.uid, id, updates);
    } else {
      setIdeas(prev =>
        prev.map(i => i.id === id ? { ...i, ...updates } : i)
      );
    }
  }, [ideas, useFirebase, firebaseUser]);

  // Add a new tag
  const addTag = useCallback(async (tagName) => {
    const normalized = tagName.trim();
    if (normalized && !tags.includes(normalized)) {
      const newTags = [...tags, normalized];
      if (useFirebase && firebaseUser) {
        await firestoreTags.save(firebaseUser.uid, newTags);
      } else {
        setTags(newTags);
      }
    }
  }, [tags, useFirebase, firebaseUser]);

  // Add multiple tags
  const addTags = useCallback(async (newTagsList) => {
    const uniqueNewTags = newTagsList
      .map(t => t.trim())
      .filter(t => t && !tags.includes(t));
    if (uniqueNewTags.length > 0) {
      const updatedTags = [...tags, ...uniqueNewTags];
      if (useFirebase && firebaseUser) {
        await firestoreTags.save(firebaseUser.uid, updatedTags);
      } else {
        setTags(updatedTags);
      }
    }
  }, [tags, useFirebase, firebaseUser]);

  // Delete a tag
  const deleteTag = useCallback(async (tagName) => {
    const updatedTags = tags.filter(t => t !== tagName);

    if (useFirebase && firebaseUser) {
      await firestoreTags.save(firebaseUser.uid, updatedTags);
      // Update all ideas that have this tag
      const ideasWithTag = ideas.filter(idea => idea.tags.includes(tagName));
      for (const idea of ideasWithTag) {
        await firestoreIdeas.update(firebaseUser.uid, idea.id, {
          tags: idea.tags.filter(t => t !== tagName),
        });
      }
    } else {
      setTags(updatedTags);
      setIdeas(prev =>
        prev.map(idea => ({
          ...idea,
          tags: idea.tags.filter(t => t !== tagName),
        }))
      );
    }
  }, [tags, ideas, useFirebase, firebaseUser]);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

  // Reconnect to Firebase (after config change)
  const reconnectFirebase = useCallback(async () => {
    // Unsubscribe from current subscriptions
    if (unsubscribeIdeasRef.current) unsubscribeIdeasRef.current();
    if (unsubscribeTagsRef.current) unsubscribeTagsRef.current();

    setFirebaseStatus('connecting');
    setIsLoading(true);

    const config = getFirebaseConfig();
    if (config && config.apiKey && config.projectId) {
      const result = initializeFirebase(config);
      if (result) {
        setUseFirebase(true);
        const user = await signInAnonymouslyToFirebase();
        if (user) {
          setFirebaseUser(user);
          setFirebaseStatus('connected');
        } else {
          setFirebaseStatus('error');
          setUseFirebase(false);
          setIsLoading(false);
        }
      } else {
        setFirebaseStatus('error');
        setUseFirebase(false);
        setIsLoading(false);
      }
    } else {
      setUseFirebase(false);
      setFirebaseStatus('unconfigured');
      setIdeas(getIdeas());
      setTags(getTags());
      setIsLoading(false);
    }
  }, []);

  // Migrate localStorage data to Firebase
  const migrateToFirebase = useCallback(async () => {
    if (!useFirebase || !firebaseUser) return false;

    try {
      const localIdeas = getIdeas();
      const localTags = getTags();

      // Upload ideas
      for (const idea of localIdeas) {
        await firestoreIdeas.add(firebaseUser.uid, idea);
      }

      // Upload tags
      if (localTags.length > 0) {
        const existingTags = await firestoreTags.get(firebaseUser.uid);
        const mergedTags = [...new Set([...existingTags, ...localTags])];
        await firestoreTags.save(firebaseUser.uid, mergedTags);
      }

      return true;
    } catch (error) {
      console.error('Migration error:', error);
      return false;
    }
  }, [useFirebase, firebaseUser]);

  const value = {
    ideas,
    tags,
    settings,
    isLoading,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleFavorite,
    addTag,
    addTags,
    deleteTag,
    updateSettings,
    // Firebase related
    useFirebase,
    firebaseStatus,
    firebaseUser,
    reconnectFirebase,
    migrateToFirebase,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
