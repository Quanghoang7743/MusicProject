import React from "react";
import { Play } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const ArtistCard = ({ id, name, image }) => {
  const navigate = useNavigate();

  const handleImageError = (e) => {
    e.target.onerror = null;
    e.target.src = '/images/artist1.jpg';
  };

  const handlePlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Navigate to artist page to play their songs
    navigate(`/artists/${id}`);
  };

  return (
    <Link
      to={`/artists/${id}`}
      className="group cursor-pointer text-center bg-slate-800/40 hover:bg-slate-800/60 border border-cyan-500/10 hover:border-cyan-400/30 rounded-xl p-4 transition-all"
    >
      {/* Artist Image */}
      <div className="relative mb-3 overflow-hidden rounded-full aspect-square">
        {image ? (
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-4xl">
            👤
          </div>
        )}

        {/* Play Button */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center transform scale-0 group-hover:scale-100 transition-all shadow-lg hover:scale-110"
          >
            <Play className="w-5 h-5 text-slate-900" fill="currentColor" />
          </button>
        </div>
      </div>

      {/* Artist Info */}
      <h3 className="font-medium text-sm truncate text-white group-hover:text-cyan-400 transition">
        {name}
      </h3>
    </Link>
  );
};

export default ArtistCard;