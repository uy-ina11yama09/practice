import { useState } from 'react';
import { Send, Loader, Sparkles, RefreshCw } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { generateTitle, generateTagSuggestions, generateFeedback } from '../utils/ai';
import TagSelector from './TagSelector';

const IdeaForm = ({ onComplete }) => {
  const { addIdea, addTags, tags, settings } = useApp();
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [suggestedTags, setSuggestedTags] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateAI = async () => {
    if (!content.trim()) {
      setError('アイデアを入力してください');
      return;
    }

    if (!settings.apiKey) {
      setError('AIを使用するには、設定画面でAPIキーを入力してください');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const promises = [];

      if (settings.autoGenerateTitle && !title) {
        promises.push(
          generateTitle(content, settings)
            .then(t => setTitle(t.trim()))
            .catch(e => console.error('Title generation failed:', e))
        );
      }

      if (settings.autoSuggestTags) {
        promises.push(
          generateTagSuggestions(content, tags, settings)
            .then(suggestions => setSuggestedTags(suggestions))
            .catch(e => console.error('Tag suggestion failed:', e))
        );
      }

      promises.push(
        generateFeedback(content, settings)
          .then(fb => setFeedback(fb))
          .catch(e => console.error('Feedback generation failed:', e))
      );

      await Promise.all(promises);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!content.trim()) {
      setError('アイデアを入力してください');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Add new tags to the global list
      addTags(selectedTags);

      // Create the idea
      addIdea({
        content: content.trim(),
        title: title.trim() || '無題のアイデア',
        tags: selectedTags,
        feedback: feedback,
      });

      // Reset form
      setContent('');
      setTitle('');
      setSelectedTags([]);
      setSuggestedTags([]);
      setFeedback('');

      if (onComplete) {
        onComplete();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    setError('');
  };

  return (
    <form className="idea-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <label htmlFor="content">アイデアを書く</label>
        <textarea
          id="content"
          placeholder="思いついたアイデアを自由に書いてください..."
          value={content}
          onChange={handleContentChange}
          rows={6}
          className="idea-textarea"
        />
      </div>

      <div className="ai-actions">
        <button
          type="button"
          onClick={handleGenerateAI}
          disabled={isGenerating || !content.trim()}
          className="btn btn-secondary"
        >
          {isGenerating ? (
            <>
              <Loader size={16} className="spin" />
              AI処理中...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              AIで分析
            </>
          )}
        </button>
      </div>

      <div className="form-section">
        <label htmlFor="title">
          タイトル
          {settings.autoGenerateTitle && (
            <span className="label-hint">（AIが自動生成）</span>
          )}
        </label>
        <input
          id="title"
          type="text"
          placeholder="アイデアのタイトル"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="title-input"
        />
      </div>

      <div className="form-section">
        <label>
          タグ
          {settings.autoSuggestTags && (
            <span className="label-hint">（AI推奨あり）</span>
          )}
        </label>
        <TagSelector
          selectedTags={selectedTags}
          onChange={setSelectedTags}
          suggestedTags={suggestedTags}
        />
      </div>

      {feedback && (
        <div className="form-section feedback-section">
          <div className="feedback-header">
            <label>AIからのフィードバック</label>
            <button
              type="button"
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="btn-icon"
              title="再生成"
            >
              <RefreshCw size={14} className={isGenerating ? 'spin' : ''} />
            </button>
          </div>
          <div className="feedback-content">{feedback}</div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="btn btn-primary"
        >
          {isSubmitting ? (
            <>
              <Loader size={16} className="spin" />
              保存中...
            </>
          ) : (
            <>
              <Send size={16} />
              アイデアを保存
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default IdeaForm;
