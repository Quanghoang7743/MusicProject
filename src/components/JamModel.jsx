import { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Radio } from 'lucide-react';
import QRCode from "react-qr-code";
import playlistService from '../services/playlistService';

const JamModal = ({ isOpen, onClose, currentUser }) => {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [inviteStatus, setInviteStatus] = useState(''); // 'sending', 'success', 'error'
  const [copied, setCopied] = useState(false);

 useEffect(() => {
  if (isOpen && !sessionData) {
    const initSession = async () => {
      try {
        setLoading(true);
        const res = await playlistService.startSession();
        
        // [CẬP NHẬT LOGIC LẤY DỮ LIỆU]
        // Dựa trên ảnh Swagger: dữ liệu nằm trong res.data (nếu dùng axios thuần thì là res.data.data)
        // Hãy console.log(res) để chắc chắn
        
        const inviteLink = res.data?.inviteLink || res.inviteLink;
        const sessionId = res.data?.sessionId || ""; // Nếu API có trả về ID phòng

        if (inviteLink) {
            setSessionData({ inviteLink, sessionId });
        } else {
            // Fallback nếu API chưa trả về dữ liệu thật
            console.warn("API response structure might differ", res);
        }

      } catch (error) {
        console.error("Failed to start jam", error);
        setInviteStatus('error');
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }
}, [isOpen]);

  const handleCopy = () => {
    if (sessionData?.inviteLink) {
      navigator.clipboard.writeText(sessionData.inviteLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!email.trim() || !sessionData) return;

    setInviteStatus('sending');
    try {
      await playlistService.inviteByEmail(sessionData.sessionId, email);
      setInviteStatus('success');
      setEmail('');
      setTimeout(() => setInviteStatus(''), 3000);
    } catch (err) {
      setInviteStatus('error');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl w-full max-w-md shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            <h2 className="text-xl font-bold text-white">Start a Jam</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="w-10 h-10 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-400">Creating session...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* QR Code Section */}
              <div className="flex flex-col items-center bg-white p-4 rounded-xl w-fit mx-auto shadow-inner">
                <QRCode 
                    value={sessionData?.inviteLink || ""} 
                    size={160}
                    fgColor="#0f172a" // Slate 900
                />
              </div>
              <p className="text-center text-sm text-slate-400">Scan to join {currentUser?.name}'s queue</p>

              {/* Copy Link */}
              <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-lg border border-white/5">
                <input 
                  readOnly 
                  value={sessionData?.inviteLink} 
                  className="bg-transparent text-sm text-slate-300 flex-1 outline-none px-2"
                />
                <button 
                  onClick={handleCopy}
                  className="p-2 bg-slate-700 hover:bg-cyan-600 text-white rounded transition"
                  title="Copy Link"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink-0 mx-4 text-slate-500 text-xs uppercase">Or invite by email</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              {/* Email Invite Form */}
              <form onSubmit={handleInvite} className="relative">
                <input
                  type="email"
                  placeholder="Enter friend's email..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-4 pr-12 py-3 text-sm text-white focus:border-cyan-500 focus:outline-none transition"
                />
                <button 
                  type="submit"
                  disabled={inviteStatus === 'sending' || !email}
                  className="absolute right-1 top-1 bottom-1 bg-cyan-500 hover:bg-cyan-400 text-white px-3 rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {inviteStatus === 'sending' ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>

              {inviteStatus === 'success' && <p className="text-green-400 text-xs text-center">Invitation sent successfully!</p>}
              {inviteStatus === 'error' && <p className="text-red-400 text-xs text-center">Failed to send invitation.</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JamModal;