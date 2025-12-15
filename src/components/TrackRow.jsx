import { Heart, Plus } from 'lucide-react';
import PropTypes from 'prop-types';

const TrackRow = ({
  rank,
  title,
  artist,
  duration,
  coverArt,
  onSelect,
  onLike,
  onAddToPlaylist,
  isClickable = true,
  isLiked = false
}) => {
  const handleLikeClick = (e) => {
    e.stopPropagation();
    if (onLike) onLike();
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddToPlaylist) onAddToPlaylist();
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/song1.jpg';
  };

  const content = (
    <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/50 transition group w-full">
      <div className="w-8 text-center text-slate-400 font-medium">
        {String(rank).padStart(2, '0')}
      </div>

      {/* Cover Art */}
      <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
        {coverArt ? (
          <img
            src={coverArt}
            alt={title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-xl">
            🎵
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{title}</div>
        <div className="text-xs text-slate-400 truncate">{artist}</div>
      </div>

      <div className="text-sm text-slate-400">{duration}</div>

      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
        <button
          onClick={handleLikeClick}
          className={`w-8 h-8 rounded-full hover:bg-slate-700 flex items-center justify-center transition ${isLiked ? 'text-red-500' : ''
            }`}
          title={isLiked ? "Unlike" : "Like"}
        >
          <Heart className="w-4 h-4" fill={isLiked ? "currentColor" : "none"} />
        </button>
        <button
          onClick={handleAddClick}
          className="w-8 h-8 rounded-full hover:bg-slate-700 flex items-center justify-center"
          title="Add to playlist"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  if (!isClickable) {
    return content;
  }

  return (
    <div
      onClick={onSelect}
      className="w-full text-left cursor-pointer"
      role="button"
      tabIndex="0"
      onKeyDown={(e) => { if (e.key === 'Enter' && onSelect) onSelect(); }}
    >
      {content}
    </div>
  );
};

TrackRow.propTypes = {
  rank: PropTypes.number.isRequired,
  title: PropTypes.string.isRequired,
  artist: PropTypes.string.isRequired,
  duration: PropTypes.string.isRequired,
  coverArt: PropTypes.string,
  onSelect: PropTypes.func,
  onLike: PropTypes.func,
  onAddToPlaylist: PropTypes.func,
  isClickable: PropTypes.bool,
  isLiked: PropTypes.bool,
};

export default TrackRow;
