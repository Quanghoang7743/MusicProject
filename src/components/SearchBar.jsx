import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Mic, Disc, X } from 'lucide-react';
import songService from '../services/songService';
import artistService from '../services/artistService';
import albumService from '../services/albumService';

const SearchBar = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({ songs: [], artists: [], albums: [] });
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load suggestions when component mounts
    useEffect(() => {
        const loadSuggestions = async () => {
            try {
                const suggestedSongs = await songService.getSuggestions();
                setSuggestions(Array.isArray(suggestedSongs) ? suggestedSongs : []);
            } catch (error) {
                console.error('Error loading suggestions:', error);
                setSuggestions([]);
            }
        };
        loadSuggestions();
    }, []);

    // Debounced search when user types
    useEffect(() => {
        const delaySearch = setTimeout(() => {
            if (searchQuery.trim().length > 0) {
                performSearch(searchQuery);
            } else {
                // Clear search results when query is empty
                setSearchResults({ songs: [], artists: [], albums: [] });
            }
        }, 200);
        return () => clearTimeout(delaySearch);
    }, [searchQuery]);

    const performSearch = async (query) => {
        setIsSearching(true);
        try {
            const [songsRes, artistsRes, albumsRes] = await Promise.all([
                songService.search(query, { limit: 5 }),
                artistService.search(query, { limit: 5 }),
                albumService.search(query, { limit: 5 })
            ]);

            setSearchResults({
                songs: songsRes.items || [],
                artists: artistsRes.items || [],
                albums: albumsRes.items || []
            });
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleFocus = () => {
        setShowResults(true);
    };

    const handleClear = () => {
        setSearchQuery('');
        setSearchResults({ songs: [], artists: [], albums: [] });
    };

    const handleResultClick = (type, id) => {
        setShowResults(false);
        setSearchQuery('');
        if (type === 'song') navigate(`/song/${id}`);
        else if (type === 'artist') navigate(`/artists/${id}`);
        else if (type === 'album') navigate(`/album/${id}`);
    };

    const totalResults = searchResults.songs.length + searchResults.artists.length + searchResults.albums.length;
    const showSuggestions = searchQuery.trim().length === 0 && suggestions.length > 0;
    const showSearchResults = searchQuery.trim().length > 0;

    return (
        <div ref={searchRef} className="relative w-40 md:w-60 lg:w-80">
            <div className="relative flex items-center">
                <input
                    type="text"
                    placeholder="Search Music Here..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleFocus}
                    className="bg-white text-slate-900 rounded-l-lg pl-4 pr-12 py-2.5 w-full focus:outline-none text-sm"
                />
                {searchQuery && (
                    <button
                        onClick={handleClear}
                        className="absolute right-14 text-slate-400 hover:text-slate-600 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
                <button className="bg-[#00bcd4] hover:bg-[#00acc1] px-4 py-2.5 rounded-r-lg transition flex items-center justify-center">
                    {isSearching ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-white" />
                    )}
                </button>
            </div>

            {/* Dropdown */}
            {showResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-2xl border border-cyan-500/20 max-h-96 overflow-y-auto z-50 custom-scrollbar">
                    {/* Show Suggestions when search is empty */}
                    {showSuggestions && (
                        <div className="p-2">
                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase">
                                <Music className="w-4 h-4" />
                                Suggested for you
                            </div>
                            {suggestions.slice(0, 8).map((song) => (
                                <button
                                    key={song.id}
                                    onClick={() => handleResultClick('song', song.id)}
                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition text-left"
                                >
                                    <img
                                        src={song.thumbnailUrl || '/default-song.png'}
                                        alt={song.title}
                                        className="w-10 h-10 rounded object-cover"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-white truncate">{song.title}</div>
                                        <div className="text-xs text-slate-400 truncate">
                                            {song.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Show Search Results when typing */}
                    {showSearchResults && (
                        <>
                            {isSearching ? (
                                <div className="p-4 text-center text-slate-400">Searching...</div>
                            ) : totalResults === 0 ? (
                                <div className="p-4 text-center text-slate-400">No results found</div>
                            ) : (
                                <>
                                    {/* Songs */}
                                    {searchResults.songs.length > 0 && (
                                        <div className="p-2">
                                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase">
                                                <Music className="w-4 h-4" />
                                                Songs
                                            </div>
                                            {searchResults.songs.map((song) => (
                                                <button
                                                    key={song.id}
                                                    onClick={() => handleResultClick('song', song.id)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition text-left"
                                                >
                                                    <img
                                                        src={song.thumbnailUrl || '/default-song.png'}
                                                        alt={song.title}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white truncate">{song.title}</div>
                                                        <div className="text-xs text-slate-400 truncate">
                                                            {song.artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Artists */}
                                    {searchResults.artists.length > 0 && (
                                        <div className="p-2 border-t border-cyan-500/20">
                                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase">
                                                <Mic className="w-4 h-4" />
                                                Artists
                                            </div>
                                            {searchResults.artists.map((artist) => (
                                                <button
                                                    key={artist.id}
                                                    onClick={() => handleResultClick('artist', artist.id)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition text-left"
                                                >
                                                    <img
                                                        src={artist.imageUrl || artist.avatar_url || '/default-artist.png'}
                                                        alt={artist.name}
                                                        className="w-10 h-10 rounded-full object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white truncate">{artist.name}</div>
                                                        <div className="text-xs text-slate-400">Artist</div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    {/* Albums */}
                                    {searchResults.albums.length > 0 && (
                                        <div className="p-2 border-t border-cyan-500/20">
                                            <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-cyan-400 uppercase">
                                                <Disc className="w-4 h-4" />
                                                Albums
                                            </div>
                                            {searchResults.albums.map((album) => (
                                                <button
                                                    key={album.id}
                                                    onClick={() => handleResultClick('album', album.id)}
                                                    className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700/50 rounded-lg transition text-left"
                                                >
                                                    <img
                                                        src={album.coverImageUrl || album.cover_url || '/default-album.png'}
                                                        alt={album.title}
                                                        className="w-10 h-10 rounded object-cover"
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium text-white truncate">{album.title}</div>
                                                        <div className="text-xs text-slate-400 truncate">
                                                            {album.artist?.name || 'Various Artists'}
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchBar;