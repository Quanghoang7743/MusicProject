import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Play } from "lucide-react";
import artistService from "../../services/artistService";
import songService from "../../services/songService";
import { getImageUrl } from "../../utils/imageHelper";
import { useFavorites } from '../FavouritePage/FavouritePage';
import { Heart } from 'lucide-react';

const ArtistDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toggleFavorite, isFavorite } = useFavorites();

  const [loading, setLoading] = useState(true);
  const [artist, setArtist] = useState(null);
  const [artistSongs, setArtistSongs] = useState([]);

  useEffect(() => {
    const fetchArtistAndSongs = async () => {
      try {
        setLoading(true);

        // Fetch artist details
        const artistResponse = await artistService.getById(id);

        // Transform artist data
        const artistData = {
          id: artistResponse.id,
          name: artistResponse.name,
          image: getImageUrl(artistResponse.avatar_url, 'artist'),
          bio: artistResponse.bio,
          albums: artistResponse.albums || []
        };

        setArtist(artistData);

        // Fetch songs by this artist using songService
        const songsResponse = await songService.getByArtist(id);
        const songs = songsResponse.items || [];

        // Transform songs data
        const transformedSongs = songs.map(song => ({
          id: song.id,
          title: song.title,
          artist: artistData.name,
          coverArt: getImageUrl(song.thumbnailUrl || song.thumbnail_url, 'song'),
          duration: formatDuration(song.durationSeconds || song.duration_seconds),
          plays: formatPlays(song.playCount || song.play_count || 0)
        }));

        setArtistSongs(transformedSongs);
      } catch (error) {
        console.error('Error fetching artist:', error);
        setArtist(null);
      } finally {
        setLoading(false);
      }
    };

    fetchArtistAndSongs();
  }, [id]);

  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const formatPlays = (count) => {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleSongClick = (songId) => {
    navigate(`/song/${songId}`);
  };

  const renderArtistImage = () => {
    if (
      artist.image &&
      (artist.image.startsWith('/images') ||
        artist.image.startsWith('http') ||
        artist.image.includes('placeholder'))
    ) {
      return (
        <img
          src={artist.image}
          alt={artist.name}
          className="w-full h-full object-cover"
        />
      );
    }
    return (
      <div className="w-full h-full bg-gradient-to-br from-cyan-600 to-blue-600 flex items-center justify-center text-6xl">
        👤
      </div>
    );
  };

  if (loading) {
    return (
      <main className="pt-24 pb-32 px-4 md:px-8 bg-[#0B1221] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-slate-400">Loading artist...</p>
        </div>
      </main>
    );
  }

  if (!artist) {
    return (
      <main className="pt-24 pb-32 px-4 md:px-8 bg-[#0B1221] min-h-screen">
        <div className="text-center mt-20">
          <h1 className="text-2xl font-bold text-white mb-4">Artist not found 😢</h1>
          <button
            onClick={() => navigate('/artists')}
            className="px-6 py-3 bg-cyan-500 rounded-lg text-white hover:bg-cyan-400 transition"
          >
            Back to Artists
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="pt-24 pb-0 px-4 md:px-8 bg-[#0B1221] min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => navigate('/artists')}
        className="flex items-center gap-2 text-slate-300 hover:text-cyan-400 transition mb-8"
      >
        <ChevronLeft className="w-5 h-5" />
        Back to Artists
      </button>

      <div className="max-w-full mx-auto">
        {/* Artist Header */}
        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
          {/* Artist Avatar */}
          <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-cyan-500 shadow-lg shadow-cyan-500/20 flex-shrink-0">
            {renderArtistImage()}
          </div>

          {/* Artist Info */}
          <div className="text-center md:text-left">
            <p className="text-sm text-slate-400 uppercase tracking-wider mb-2">Artist</p>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              {artist.name}
            </h1>
            <p className="text-slate-300 mb-2">
              {artistSongs.length} {artistSongs.length === 1 ? 'song' : 'songs'}
            </p>
            {artist.bio && (
              <p className="text-slate-400 text-sm max-w-2xl">
                {artist.bio}
              </p>
            )}
          </div>
        </div>

        {/* Songs Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">
              Popular Tracks
            </h2>
          </div>

          {artistSongs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {artistSongs.map((song) => (
                <div
                  key={song.id}
                  onClick={() => handleSongClick(song.id)}
                  className="bg-slate-800/40 rounded-xl p-4 hover:bg-slate-800/60 transition cursor-pointer group border border-slate-700/50"
                >
                  {/* Song Cover */}
                  <div className="relative mb-4 aspect-square rounded-lg overflow-hidden">
                    <img
                      src={song.coverArt}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite({
                          id: song.id,
                          title: song.title,
                          artists: [{ name: song.artist }],
                          thumbnailUrl: song.coverArt,
                          durationSeconds: 180 // You can parse from song.duration
                        });
                      }}
                      className="absolute top-2 right-2 p-2 bg-slate-900/80 rounded-full hover:bg-slate-800 z-10 opacity-0 group-hover:opacity-100 transition"
                    >
                      <Heart
                        className={`w-5 h-5 ${isFavorite(song.id) ? 'fill-red-500 text-red-500' : 'text-white'
                          }`}
                      />
                    </button>

                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <div className="w-12 h-12 bg-cyan-500 rounded-full flex items-center justify-center">
                        <Play className="w-6 h-6 text-white fill-white ml-1" />
                      </div>
                    </div>
                  </div>
                  {/* Song Info */}
                  <h3 className="font-semibold text-white text-base mb-1 truncate">
                    {song.title}
                  </h3>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">No songs found for this artist.</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default ArtistDetail;