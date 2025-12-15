import React from "react";
import { Play } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AlbumCard = ({ id, title, artist, coverArt, isSong = false, onClick }) => {
  const navigate = useNavigate();

  const handleCardClick = (e) => {
    if (onClick) {
      onClick(e);
    } else {
      if (isSong) {
        navigate(`/song/${id}`);
      } else {
        navigate(`/album/${id}`);
      }
    }
  };

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = 'https://placehold.co/200x200/1e293b/64748b?text=No+Image';
  };

  return (
    <div
      onClick={handleCardClick}
      className="group cursor-pointer bg-slate-800/40 hover:bg-slate-800/60 border border-cyan-500/10 hover:border-cyan-400/30 rounded-xl p-4 transition-all duration-300 relative overflow-hidden"
    >
      {/* Cover Art */}
      <div className="relative mb-4 rounded-lg overflow-hidden aspect-square bg-slate-900">
        {coverArt ? (
          <img
            src={coverArt}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-cyan-600 to-blue-600 text-3xl">
            🎵
          </div>
        )}

        {/* Play button overlay */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCardClick(e);
          }}
          className="absolute bottom-3 right-3 w-10 h-10 md:w-12 md:h-12 bg-cyan-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 scale-0 group-hover:scale-100 transition-all shadow-lg hover:scale-110 z-10"
        >
          <Play className="w-4 h-4 md:w-5 md:h-5 text-slate-900" fill="currentColor" />
        </button>
      </div>

      {/* Album Info */}
      <div>
        <h3 className="font-semibold text-sm md:text-base text-white truncate group-hover:text-cyan-400 transition">
          {title}
        </h3>
        <p className="text-xs md:text-sm text-slate-400 truncate">{artist}</p>
      </div>
    </div>
  );
};

export default AlbumCard;