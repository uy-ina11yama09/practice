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
  Database,
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Loader,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { exportData, importData } from '../utils/storage';
import {
  getFirebaseConfig,
  saveFirebaseConfig,
  clearFirebaseConfig,
} from '../utils/firebase';

const Settings = () => {
  const {
    settings,
    updateSettings,
    tags,
    deleteTag,
    ideas,
    useFirebase,
    firebaseStatus,
    reconnectFirebase,
    migrateToFirebase,
  } = useApp();

  const [showApiKey, setShowApiKey] = useState(false);
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const fileInputRef = useRef(null);

  // Firebase config state
  const [firebaseConfig, setFirebaseConfig] = useState(() => {
    const saved = getFirebaseConfig();
    return saved || {
      apiKey: '',
      authDomain: '',
      projectId: '',
      storageBucket: '',
      messagingSenderId: '',
      appId: '',
    };
  });
  const [showFirebaseKey, setShowFirebaseKey] = useState(false);
  const [firebaseMessage, setFirebaseMessage] = useState('');
  const [isMigrating, setIsMigrating] = useState(false);

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

  // Firebase handlers
  const handleFirebaseConfigChange = (field, value) => {
    setFirebaseConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveFirebaseConfig = async () => {
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      setFirebaseMessage('APIキーとプロジェクトIDは必須です');
      return;
    }

    saveFirebaseConfig(firebaseConfig);
    setFirebaseMessage('設定を保存しました。接続中...');

    await reconnectFirebase();

    if (firebaseStatus === 'connected') {
      setFirebaseMessage('Firebaseに接続しました！');
    }
  };

  const handleDisconnectFirebase = () => {
    if (window.confirm('Firebase接続を解除しますか？データはローカルストレージに保存されます。')) {
      clearFirebaseConfig();
      window.location.reload();
    }
  };

  const handleMigrateData = async () => {
    if (!window.confirm('ローカルのデータをFirebaseに移行しますか？')) return;

    setIsMigrating(true);
    const success = await migrateToFirebase();
    setIsMigrating(false);

    if (success) {
      setFirebaseMessage('データの移行が完了しました！');
    } else {
      setFirebaseMessage('データの移行に失敗しました');
    }
  };

  const getStatusIcon = () => {
    switch (firebaseStatus) {
      case 'connected':
        return <CheckCircle size={16} className="status-icon success" />;
      case 'connecting':
        return <Loader size={16} className="status-icon spin" />;
      case 'error':
        return <XCircle size={16} className="status-icon error" />;
      default:
        return <CloudOff size={16} className="status-icon" />;
    }
  };

  const getStatusText = () => {
    switch (firebaseStatus) {
      case 'connected':
        return '接続中';
      case 'connecting':
        return '接続処理中...';
      case 'error':
        return '接続エラー';
      default:
        return '未設定';
    }
  };

  return (
    <div className="settings-container">
      <h2>設定</h2>

      {/* Firebase Settings Section */}
      <section className="settings-section">
        <h3>
          <Database size={18} />
          データ保存先（Firebase）
        </h3>

        <div className="firebase-status">
          <div className="status-row">
            <span className="status-label">ステータス:</span>
            <span className={`status-value ${firebaseStatus}`}>
              {getStatusIcon()}
              {getStatusText()}
            </span>
          </div>
          <div className="status-row">
            <span className="status-label">保存先:</span>
            <span className="status-value">
              {useFirebase ? (
                <>
                  <Cloud size={14} /> Firebase (クラウド)
                </>
              ) : (
                <>
                  <CloudOff size={14} /> LocalStorage (ブラウザ)
                </>
              )}
            </span>
          </div>
        </div>

        {!useFirebase && (
          <div className="firebase-setup">
            <p className="setting-hint">
              Firebaseを設定すると、データがクラウドに保存され、複数端末で同期できます。
            </p>

            <div className="setting-item">
              <label>API Key *</label>
              <div className="api-key-input">
                <input
                  type={showFirebaseKey ? 'text' : 'password'}
                  value={firebaseConfig.apiKey}
                  onChange={(e) => handleFirebaseConfigChange('apiKey', e.target.value)}
                  placeholder="AIza..."
                />
                <button
                  type="button"
                  onClick={() => setShowFirebaseKey(!showFirebaseKey)}
                  className="btn-icon"
                >
                  {showFirebaseKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="setting-item">
              <label>Project ID *</label>
              <input
                type="text"
                value={firebaseConfig.projectId}
                onChange={(e) => handleFirebaseConfigChange('projectId', e.target.value)}
                placeholder="my-project-id"
                className="setting-input"
              />
            </div>

            <div className="setting-item">
              <label>Auth Domain</label>
              <input
                type="text"
                value={firebaseConfig.authDomain}
                onChange={(e) => handleFirebaseConfigChange('authDomain', e.target.value)}
                placeholder="my-project.firebaseapp.com"
                className="setting-input"
              />
            </div>

            <div className="firebase-actions">
              <button onClick={handleSaveFirebaseConfig} className="btn btn-primary">
                <Cloud size={16} />
                Firebaseに接続
              </button>
            </div>
          </div>
        )}

        {useFirebase && firebaseStatus === 'connected' && (
          <div className="firebase-connected">
            <div className="firebase-actions">
              <button onClick={handleMigrateData} className="btn btn-secondary" disabled={isMigrating}>
                {isMigrating ? (
                  <>
                    <Loader size={16} className="spin" />
                    移行中...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    ローカルデータを移行
                  </>
                )}
              </button>
              <button onClick={handleDisconnectFirebase} className="btn btn-secondary">
                <CloudOff size={16} />
                接続解除
              </button>
            </div>
          </div>
        )}

        {firebaseMessage && (
          <div className={`firebase-message ${firebaseStatus === 'error' ? 'error' : 'success'}`}>
            {firebaseMessage}
          </div>
        )}
      </section>

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
