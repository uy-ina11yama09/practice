import { useState } from 'react';
import { X, Plus, Tag } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const TagSelector = ({ selectedTags, onChange, suggestedTags = [] }) => {
  const { tags: allTags, addTag } = useApp();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleAddTag = (tag) => {
    if (tag && !selectedTags.includes(tag)) {
      addTag(tag);
      onChange([...selectedTags, tag]);
    }
    setInputValue('');
    setIsOpen(false);
  };

  const handleRemoveTag = (tag) => {
    onChange(selectedTags.filter(t => t !== tag));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      handleAddTag(inputValue.trim());
    }
  };

  const filteredTags = allTags.filter(
    tag =>
      !selectedTags.includes(tag) &&
      tag.toLowerCase().includes(inputValue.toLowerCase())
  );

  const unusedSuggestedTags = suggestedTags.filter(
    tag => !selectedTags.includes(tag)
  );

  return (
    <div className="tag-selector">
      <div className="selected-tags">
        {selectedTags.map(tag => (
          <span key={tag} className="tag selected">
            <Tag size={12} />
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="tag-remove"
            >
              <X size={12} />
            </button>
          </span>
        ))}
      </div>

      {unusedSuggestedTags.length > 0 && (
        <div className="suggested-tags">
          <span className="suggested-label">AI推奨:</span>
          {unusedSuggestedTags.map(tag => (
            <button
              key={tag}
              type="button"
              className="tag suggested"
              onClick={() => handleAddTag(tag)}
            >
              <Plus size={12} />
              {tag}
            </button>
          ))}
        </div>
      )}

      <div className="tag-input-wrapper">
        <input
          type="text"
          placeholder="タグを追加..."
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          onKeyDown={handleKeyDown}
          className="tag-input"
        />

        {isOpen && (inputValue || filteredTags.length > 0) && (
          <div className="tag-dropdown">
            {inputValue && !allTags.includes(inputValue) && (
              <button
                type="button"
                className="tag-option new"
                onClick={() => handleAddTag(inputValue)}
              >
                <Plus size={14} />
                「{inputValue}」を作成
              </button>
            )}
            {filteredTags.map(tag => (
              <button
                key={tag}
                type="button"
                className="tag-option"
                onClick={() => handleAddTag(tag)}
              >
                <Tag size={14} />
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TagSelector;
