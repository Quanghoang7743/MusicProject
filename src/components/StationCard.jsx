import React from 'react';
import { Play } from 'lucide-react';

const StationCard = ({ id, title, gradient = "from-cyan-900 to-blue-900", onPlay }) => {
  const handlePlay = (e) => {
    e.stopPropagation();
    if (onPlay) {
      onPlay(id);
    } else {
      console.log(`Playing station: ${title}`);
    }
  };

  return (
    <div
      className="group cursor-pointer relative overflow-hidden rounded-xl aspect-video bg-gradient-to-br"
      style={{
        backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))`
      }}
      onClick={handlePlay}
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition" />
      <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-30">
        📻
      </div>
      <div className="absolute bottom-4 left-4">
        <h3 className="font-bold text-lg text-white">{title}</h3>
      </div>
      <button
        onClick={handlePlay}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-cyan-400 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transform scale-0 group-hover:scale-100 transition"
      >
        <Play className="w-6 h-6 text-slate-900" fill="currentColor" />
      </button>
    </div>
  );
};

export default StationCard;