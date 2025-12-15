// src/components/JamQueueSidebar.jsx
import { useState, useEffect } from 'react';
import { X, Copy, Check, MoreHorizontal, PlayCircle, BarChart3, Users, Crown } from 'lucide-react';
import QRCode from "react-qr-code";
import playlistService from '../services/playlistService';
import songService from '../services/songService';
import userService from '../services/userService';

const JamQueueSidebar = ({ sessionData, onClose, currentUser, currentTrack, isPlaying }) => {
  const [activeTab, setActiveTab] = useState('queue');
  const [copied, setCopied] = useState(false);
  const [trackList, setTrackList] = useState([]);
  const [memberList, setMemberList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleCopy = () => {
    if (sessionData?.inviteLink) {
      navigator.clipboard.writeText(sessionData.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        let data = [];
        if (activeTab === 'queue') {
          data = await songService.getTopByPlayCount({ limit: 10 });
          setTrackList(Array.isArray(data) ? data : (data.items || []));
        } else if (activeTab === 'recent') {
          data = await userService.getListenHistory({ limit: 10 });
          setTrackList(Array.isArray(data) ? data : (data.items || []));
        } else if (activeTab === 'members') {
          const members = await playlistService.getParticipants(sessionData?.id);
          setMemberList(Array.isArray(members) ? members : []);
        }
      } catch (error) { console.error(error); } finally { setIsLoading(false); }
    };
    fetchData();
  }, [activeTab, sessionData]);

  // Helper render ảnh
  const renderCover = (track) => track?.thumbnailUrl || track?.cover_url || track?.coverUrl || "";

  // [CẬP NHẬT] Helper render tên Artist (Xử lý mọi trường hợp)
  const renderArtistName = (track) => {
      if (!track) return "Unknown Artist";
      // Trường hợp 1: artist là chuỗi (ví dụ: "Sơn Tùng M-TP")
      if (typeof track.artist === 'string') return track.artist;
      // Trường hợp 2: artist là object có name (ví dụ: { name: "..." })
      if (track.artist?.name) return track.artist.name;
      // Trường hợp 3: mảng artists (ví dụ: [{ name: "A" }, { name: "B" }])
      if (Array.isArray(track.artists)) return track.artists.map(a => a.name).join(', ');
      
      return "Unknown Artist";
  };

  return (
    <div className="fixed top-0 right-0 bottom-0 w-[350px] bg-slate-900 border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      
      {/* HEADER */}
      <div className="p-4 bg-slate-950 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
            <h2 className="text-white font-bold text-base">{currentUser?.name || "User"}'s Jam</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-slate-800/50 rounded-xl p-3 flex gap-3 border border-white/5">
            <div className="bg-white p-1 rounded w-20 h-20 flex-shrink-0">
                {sessionData?.inviteLink ? (
                    <QRCode value={sessionData.inviteLink} size={72} className="w-full h-full" />
                ) : (
                    <div className="w-full h-full bg-gray-200" />
                )}
            </div>
            <div className="flex-1 flex flex-col justify-center">
                 <p className="text-[10px] text-slate-400 mb-2 leading-tight">
                    Invite friends via Link or QR Code.
                 </p>
                 <button onClick={handleCopy} className="w-full py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-bold transition flex items-center justify-center gap-2">
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copied ? "Copied" : "Copy Link"}
                </button>
            </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center border-b border-white/10 bg-slate-900 px-2">
        {[{ id: 'queue', label: 'Queue' }, { id: 'recent', label: 'History' }, { id: 'members', label: 'Members', icon: Users }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1 py-3 text-xs font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-green-500 text-green-500' : 'border-transparent text-slate-400 hover:text-white'}`}>
                {tab.icon && <tab.icon className="w-3 h-3" />} {tab.label}
            </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar bg-slate-900">
         {isLoading && <div className="text-center text-slate-500 text-xs py-4">Loading...</div>}

         {!isLoading && activeTab === 'queue' && (
            <>
                {/* NOW PLAYING SECTION */}
                {currentTrack && (
                    <div className="mb-4 bg-white/5 rounded-lg p-2 border border-green-500/20">
                        <div className="text-[10px] font-bold text-green-500 uppercase mb-2 flex items-center gap-1"><BarChart3 className="w-3 h-3" /> Now Playing</div>
                        <div className="flex items-center gap-3">
                            <img src={renderCover(currentTrack)} className="w-10 h-10 rounded object-cover" alt="" />
                            <div className="flex-1 min-w-0">
                                <div className="text-green-400 text-sm font-bold truncate">{currentTrack.title}</div>
                                {/* GỌI HÀM renderArtistName ĐÃ FIX */}
                                <div className="text-slate-400 text-xs truncate">{renderArtistName(currentTrack)}</div>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* NEXT UP LIST */}
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">Next Up</div>
                {trackList.map((track, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 group cursor-pointer">
                        <div className="relative w-8 h-8 flex-shrink-0 opacity-70 group-hover:opacity-100">
                            <img src={renderCover(track)} className="w-full h-full rounded object-cover" alt="" />
                            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center rounded"><PlayCircle className="w-4 h-4 text-white" /></div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-white text-xs font-medium truncate group-hover:text-green-400">{track.title}</div>
                            {/* GỌI HÀM renderArtistName ĐÃ FIX */}
                            <div className="text-slate-500 text-[10px] truncate">{renderArtistName(track)}</div>
                        </div>
                        <MoreHorizontal className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100" />
                    </div>
                ))}
            </>
         )}

         {!isLoading && activeTab === 'recent' && trackList.map((track, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5 group cursor-pointer opacity-80">
                <img src={renderCover(track)} className="w-8 h-8 rounded object-cover grayscale group-hover:grayscale-0" alt="" />
                <div className="flex-1 min-w-0">
                    <div className="text-slate-300 text-xs font-medium truncate">{track.title}</div>
                    <div className="text-slate-500 text-[10px] truncate">{renderArtistName(track)}</div>
                </div>
            </div>
         ))}

         {!isLoading && activeTab === 'members' && (
             <div className="space-y-2">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase">Current Participants</div>
                {memberList.map((member, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-2 rounded-md hover:bg-white/5">
                        <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 overflow-hidden">
                            {member.avatar ? <img src={member.avatar} className="w-full h-full object-cover"/> : (member.name?.[0] || 'U')}
                        </div>
                        <div className="flex-1">
                            <div className="text-slate-200 text-xs font-medium flex items-center gap-1">
                                {member.name} 
                                {(member.role === 'Host' || member.isHost) && <Crown className="w-3 h-3 text-yellow-500" />}
                            </div>
                            <div className="text-[10px] text-green-500">● Online</div>
                        </div>
                    </div>
                ))}
             </div>
         )}
      </div>
    </div>
  );
};

export default JamQueueSidebar;