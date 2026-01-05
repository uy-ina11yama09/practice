import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  getIdeas,
  saveIdeas,
  getTags,
  saveTags,
  getSettings,
  saveSettings,
} from '../utils/storage';

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

  // Load data on mount
  useEffect(() => {
    setIdeas(getIdeas());
    setTags(getTags());
    setSettingsState(getSettings());
    setIsLoading(false);
  }, []);

  // Save ideas when changed
  useEffect(() => {
    if (!isLoading) {
      saveIdeas(ideas);
    }
  }, [ideas, isLoading]);

  // Save tags when changed
  useEffect(() => {
    if (!isLoading) {
      saveTags(tags);
    }
  }, [tags, isLoading]);

  // Add a new idea
  const addIdea = useCallback((ideaData) => {
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
    setIdeas(prev => [newIdea, ...prev]);
    return newIdea;
  }, []);

  // Update an idea
  const updateIdea = useCallback((id, updates) => {
    setIdeas(prev =>
      prev.map(idea =>
        idea.id === id
          ? { ...idea, ...updates, updatedAt: new Date().toISOString() }
          : idea
      )
    );
  }, []);

  // Delete an idea
  const deleteIdea = useCallback((id) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id));
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback((id) => {
    setIdeas(prev =>
      prev.map(idea =>
        idea.id === id
          ? { ...idea, isFavorite: !idea.isFavorite }
          : idea
      )
    );
  }, []);

  // Add a new tag
  const addTag = useCallback((tagName) => {
    const normalized = tagName.trim();
    if (normalized && !tags.includes(normalized)) {
      setTags(prev => [...prev, normalized]);
    }
  }, [tags]);

  // Add multiple tags
  const addTags = useCallback((newTags) => {
    const uniqueNewTags = newTags
      .map(t => t.trim())
      .filter(t => t && !tags.includes(t));
    if (uniqueNewTags.length > 0) {
      setTags(prev => [...prev, ...uniqueNewTags]);
    }
  }, [tags]);

  // Delete a tag
  const deleteTag = useCallback((tagName) => {
    setTags(prev => prev.filter(t => t !== tagName));
    // Also remove from all ideas
    setIdeas(prev =>
      prev.map(idea => ({
        ...idea,
        tags: idea.tags.filter(t => t !== tagName),
      }))
    );
  }, []);

  // Update settings
  const updateSettings = useCallback((newSettings) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      saveSettings(updated);
      return updated;
    });
  }, []);

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
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
