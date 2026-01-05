import { useState, useRef } from 'react';
import {
  Key,
  MessageSquare,
  Upload,
  Download,
  Trash2,
  Eye,
  EyeOff,
  Tag,
  X,
  AlertTriangle,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { exportData, importData, saveTags } from '../utils/storage';

const Settings = () => {
  const { settings, updateSettings, tags, deleteTag, ideas } = useApp();
  const [showApiKey, setShowApiKey] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleApiKeyChange = (e) => {
    updateSettings({ apiKey: e.target.value });
  };

  const handleProviderChange = (e) => {
    updateSettings({ apiProvider: e.target.value });
  };

  const handlePromptChange = (e) => {
    updateSettings({ feedbackPrompt: e.target.value });
  };

  const handleToggleChange = (key) => {
    updateSettings({ [key]: !settings[key] });
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideas-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (!data.ideas || !Array.isArray(data.ideas)) {
          throw new Error('無効なデータ形式です');
        }
        importData(data);
        setImportSuccess(
          `インポート完了: ${data.ideas.length}件のアイデア`
        );
        // Reload page to reflect changes
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        setImportError(err.message || 'インポートに失敗しました');
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = () => {
    if (
      window.confirm(
        '本当にすべてのデータを削除しますか？この操作は取り消せません。'
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="settings-container">
      <h2>設定</h2>

      <section className="settings-section">
        <h3>
          <Key size={18} />
          AI設定
        </h3>

        <div className="setting-item">
          <label>APIプロバイダー</label>
          <select
            value={settings.apiProvider}
            onChange={handleProviderChange}
            className="setting-select"
          >
            <option value="openai">OpenAI (GPT-4o-mini)</option>
            <option value="anthropic">Anthropic (Claude)</option>
          </select>
        </div>

        <div className="setting-item">
          <label>APIキー</label>
          <div className="api-key-input">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.apiKey}
              onChange={handleApiKeyChange}
              placeholder={
                settings.apiProvider === 'openai'
                  ? 'sk-...'
                  : 'sk-ant-...'
              }
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="btn-icon"
            >
              {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="setting-hint">
            APIキーはブラウザのLocalStorageに保存されます。
          </p>
        </div>

        <div className="setting-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.autoGenerateTitle}
              onChange={() => handleToggleChange('autoGenerateTitle')}
            />
            <span>タイトルを自動生成</span>
          </label>
        </div>

        <div className="setting-item">
          <label className="toggle-label">
            <input
              type="checkbox"
              checked={settings.autoSuggestTags}
              onChange={() => handleToggleChange('autoSuggestTags')}
            />
            <span>タグを自動推奨</span>
          </label>
        </div>
      </section>

      <section className="settings-section">
        <h3>
          <MessageSquare size={18} />
          フィードバックプロンプト
        </h3>
        <div className="setting-item">
          <textarea
            value={settings.feedbackPrompt}
            onChange={handlePromptChange}
            rows={8}
            className="prompt-textarea"
            placeholder="AIがフィードバックを生成する際に使用するプロンプトを入力..."
          />
          <p className="setting-hint">
            このプロンプトに基づいてAIがアイデアにフィードバックを生成します。
          </p>
        </div>
      </section>

      <section className="settings-section">
        <h3>
          <Tag size={18} />
          タグ管理
        </h3>
        <div className="tags-list">
          {tags.length === 0 ? (
            <p className="no-tags">登録されているタグはありません</p>
          ) : (
            tags.map((tag) => (
              <span key={tag} className="tag editable">
                {tag}
                <button
                  onClick={() => {
                    if (window.confirm(`タグ「${tag}」を削除しますか？`)) {
                      deleteTag(tag);
                    }
                  }}
                  className="tag-delete"
                >
                  <X size={12} />
                </button>
              </span>
            ))
          )}
        </div>
      </section>

      <section className="settings-section">
        <h3>
          <Download size={18} />
          データ管理
        </h3>

        <div className="data-stats">
          <p>保存されているアイデア: {ideas.length}件</p>
          <p>登録されているタグ: {tags.length}個</p>
        </div>

        <div className="data-actions">
          <button onClick={handleExport} className="btn btn-secondary">
            <Download size={16} />
            エクスポート
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-secondary"
          >
            <Upload size={16} />
            インポート
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            style={{ display: 'none' }}
          />
        </div>

        {importError && <div className="error-message">{importError}</div>}
        {importSuccess && <div className="success-message">{importSuccess}</div>}

        <div className="danger-zone">
          <h4>
            <AlertTriangle size={16} />
            危険な操作
          </h4>
          <button onClick={handleClearAllData} className="btn btn-danger">
            <Trash2 size={16} />
            すべてのデータを削除
          </button>
        </div>
      </section>
    </div>
  );
};

export default Settings;
