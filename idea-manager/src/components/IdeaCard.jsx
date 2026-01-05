import { useState } from 'react';
import {
  Star,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Tag,
  Calendar,
  MessageSquare,
  X,
  Check,
} from 'lucide-react';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useApp } from '../contexts/AppContext';
import TagSelector from './TagSelector';

const IdeaCard = ({ idea }) => {
  const { updateIdea, deleteIdea, toggleFavorite } = useApp();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: idea.title,
    content: idea.content,
    tags: idea.tags,
  });

  const handleSave = () => {
    updateIdea(idea.id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData({
      title: idea.title,
      content: idea.content,
      tags: idea.tags,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('このアイデアを削除しますか？')) {
      deleteIdea(idea.id);
    }
  };

  const formattedDate = format(new Date(idea.createdAt), 'yyyy年M月d日 HH:mm', {
    locale: ja,
  });

  if (isEditing) {
    return (
      <div className="idea-card editing">
        <div className="card-edit-form">
          <input
            type="text"
            value={editData.title}
            onChange={(e) => setEditData({ ...editData, title: e.target.value })}
            className="edit-title-input"
            placeholder="タイトル"
          />
          <textarea
            value={editData.content}
            onChange={(e) => setEditData({ ...editData, content: e.target.value })}
            className="edit-content-textarea"
            rows={4}
          />
          <div className="edit-tags">
            <TagSelector
              selectedTags={editData.tags}
              onChange={(tags) => setEditData({ ...editData, tags })}
            />
          </div>
          <div className="edit-actions">
            <button onClick={handleCancel} className="btn btn-secondary">
              <X size={14} />
              キャンセル
            </button>
            <button onClick={handleSave} className="btn btn-primary">
              <Check size={14} />
              保存
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`idea-card ${idea.isFavorite ? 'favorite' : ''}`}>
      <div className="card-header">
        <h3 className="card-title">{idea.title}</h3>
        <div className="card-actions">
          <button
            onClick={() => toggleFavorite(idea.id)}
            className={`btn-icon ${idea.isFavorite ? 'active' : ''}`}
            title={idea.isFavorite ? 'お気に入り解除' : 'お気に入り'}
          >
            <Star size={16} fill={idea.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <button
            onClick={() => setIsEditing(true)}
            className="btn-icon"
            title="編集"
          >
            <Edit2 size={16} />
          </button>
          <button onClick={handleDelete} className="btn-icon danger" title="削除">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="card-meta">
        <span className="meta-item">
          <Calendar size={12} />
          {formattedDate}
        </span>
      </div>

      <div className="card-content">
        <p className={isExpanded ? '' : 'truncated'}>{idea.content}</p>
        {idea.content.length > 150 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="expand-btn"
          >
            {isExpanded ? (
              <>
                <ChevronUp size={14} />
                閉じる
              </>
            ) : (
              <>
                <ChevronDown size={14} />
                もっと見る
              </>
            )}
          </button>
        )}
      </div>

      {idea.tags.length > 0 && (
        <div className="card-tags">
          {idea.tags.map((tag) => (
            <span key={tag} className="tag">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}

      {idea.feedback && (
        <div className="card-feedback">
          <div className="feedback-label">
            <MessageSquare size={12} />
            AIフィードバック
          </div>
          <p>{idea.feedback}</p>
        </div>
      )}
    </div>
  );
};

export default IdeaCard;
