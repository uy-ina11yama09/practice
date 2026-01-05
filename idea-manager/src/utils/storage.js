// LocalStorage keys
const STORAGE_KEYS = {
  IDEAS: 'idea-manager-ideas',
  TAGS: 'idea-manager-tags',
  SETTINGS: 'idea-manager-settings',
};

// Ideas storage
export const getIdeas = () => {
  const data = localStorage.getItem(STORAGE_KEYS.IDEAS);
  return data ? JSON.parse(data) : [];
};

export const saveIdeas = (ideas) => {
  localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas));
};

// Tags storage
export const getTags = () => {
  const data = localStorage.getItem(STORAGE_KEYS.TAGS);
  return data ? JSON.parse(data) : [];
};

export const saveTags = (tags) => {
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
};

// Settings storage
export const getSettings = () => {
  const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  const defaultSettings = {
    apiKey: '',
    apiProvider: 'openai', // 'openai' or 'anthropic'
    feedbackPrompt: `あなたは創造的なアイデアコンサルタントです。以下のアイデアに対して、建設的で前向きなフィードバックを日本語で提供してください。

フィードバックには以下を含めてください：
- アイデアの良い点
- 改善や発展の可能性
- 実現に向けた次のステップの提案

簡潔に3-5文程度でまとめてください。`,
    autoGenerateTitle: true,
    autoSuggestTags: true,
    theme: 'system', // 'light', 'dark', 'system'
  };
  return data ? { ...defaultSettings, ...JSON.parse(data) } : defaultSettings;
};

export const saveSettings = (settings) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

// Export all data
export const exportData = () => {
  return {
    ideas: getIdeas(),
    tags: getTags(),
    settings: getSettings(),
    exportedAt: new Date().toISOString(),
  };
};

// Import data
export const importData = (data) => {
  if (data.ideas) saveIdeas(data.ideas);
  if (data.tags) saveTags(data.tags);
  if (data.settings) saveSettings(data.settings);
};
