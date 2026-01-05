import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Tag,
  Star,
  X,
  Download,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import IdeaCard from './IdeaCard';
import { exportData } from '../utils/storage';

const IdeaList = () => {
  const { ideas, tags } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilterTags, setSelectedFilterTags] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest', 'oldest'
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filteredIdeas = useMemo(() => {
    let result = [...ideas];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (idea) =>
          idea.title.toLowerCase().includes(query) ||
          idea.content.toLowerCase().includes(query) ||
          idea.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedFilterTags.length > 0) {
      result = result.filter((idea) =>
        selectedFilterTags.every((tag) => idea.tags.includes(tag))
      );
    }

    // Filter by favorites
    if (showFavoritesOnly) {
      result = result.filter((idea) => idea.isFavorite);
    }

    // Sort
    result.sort((a, b) => {
      const dateA = new Date(a.createdAt);
      const dateB = new Date(b.createdAt);
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [ideas, searchQuery, selectedFilterTags, showFavoritesOnly, sortOrder]);

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

  const toggleFilterTag = (tag) => {
    setSelectedFilterTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  return (
    <div className="idea-list-container">
      <div className="list-toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            type="text"
            placeholder="アイデアを検索..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="clear-btn">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="toolbar-actions">
          <button
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            className={`btn-icon ${showFavoritesOnly ? 'active' : ''}`}
            title="お気に入りのみ"
          >
            <Star size={16} fill={showFavoritesOnly ? 'currentColor' : 'none'} />
          </button>

          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`btn-icon ${selectedFilterTags.length > 0 ? 'active' : ''}`}
            title="タグでフィルター"
          >
            <Filter size={16} />
            {selectedFilterTags.length > 0 && (
              <span className="badge">{selectedFilterTags.length}</span>
            )}
          </button>

          <button
            onClick={() =>
              setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')
            }
            className="btn-icon"
            title={sortOrder === 'newest' ? '新しい順' : '古い順'}
          >
            {sortOrder === 'newest' ? (
              <SortDesc size={16} />
            ) : (
              <SortAsc size={16} />
            )}
          </button>

          <button onClick={handleExport} className="btn-icon" title="エクスポート">
            <Download size={16} />
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="filter-panel">
          <div className="filter-header">
            <span>タグでフィルター</span>
            {selectedFilterTags.length > 0 && (
              <button
                onClick={() => setSelectedFilterTags([])}
                className="clear-filters"
              >
                すべてクリア
              </button>
            )}
          </div>
          <div className="filter-tags">
            {tags.length === 0 ? (
              <p className="no-tags">タグがありません</p>
            ) : (
              tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleFilterTag(tag)}
                  className={`tag ${
                    selectedFilterTags.includes(tag) ? 'selected' : ''
                  }`}
                >
                  <Tag size={10} />
                  {tag}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <div className="list-stats">
        <span>
          {filteredIdeas.length} / {ideas.length} 件のアイデア
        </span>
      </div>

      <div className="idea-list">
        {filteredIdeas.length === 0 ? (
          <div className="empty-state">
            {ideas.length === 0 ? (
              <>
                <p>まだアイデアがありません</p>
                <p className="hint">「新規作成」からアイデアを追加しましょう</p>
              </>
            ) : (
              <>
                <p>条件に一致するアイデアがありません</p>
                <p className="hint">検索条件やフィルターを変更してください</p>
              </>
            )}
          </div>
        ) : (
          filteredIdeas.map((idea) => <IdeaCard key={idea.id} idea={idea} />)
        )}
      </div>
    </div>
  );
};

export default IdeaList;
