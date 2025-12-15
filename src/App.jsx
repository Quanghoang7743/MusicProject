import { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { History, Search, Bell, Home, Heart, Download, Menu, Speaker, Mic, Folder, Gem, ChevronLeft, ChevronRight } from 'lucide-react';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined, UserAddOutlined, LoginOutlined } from '@ant-design/icons';
import { Crown } from 'lucide-react';
import { useAudio } from './hooks/useAudio';
import './App.css';
import { logoutService } from './services/authService';
import userService from './services/userService';
import songService from './services/songService';
import PlayerControl from './components/PlayerControl';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/Loginpage/LoginPage';
import SearchBar from './components/SearchBar';

function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const App = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { currentTrack, isPlaying } = useSelector((state) => state.player);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // State cho tính năng Jam
  const [isJamOpen, setIsJamOpen] = useState(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- MỚI: useEffect để lấy thông tin Profile chi tiết (Name, Avatar...) ---
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Chỉ gọi API nếu đã đăng nhập (có token) 
      if (localStorage.getItem('authToken')) {
        try {
          const res = await userService.getProfile();
          const profileData = res.data || res;

          setUser(prev => {
            if (!prev) return profileData;
            const updatedUser = { ...prev, ...profileData };
            localStorage.setItem('currentUser', JSON.stringify(updatedUser));
            return updatedUser;
          });
        } catch (error) {
          console.error("Failed to fetch user profile in App", error);
        }
      }
    };

    fetchUserProfile();
  }, []);

  const hasRecordedPlay = useRef(false);

  // Reset flag when track changes
  useEffect(() => {
    if (currentTrack?.id) {
      hasRecordedPlay.current = false;
    }
  }, [currentTrack?.id]);

  // Record play to API
  useEffect(() => {
    if (currentTrack?.id && isPlaying && !hasRecordedPlay.current) {
      console.log("🎧 Recording play to API:", currentTrack.title);
      songService.recordPlay(currentTrack.id);
      hasRecordedPlay.current = true;
    }
  }, [currentTrack?.id, isPlaying]);

  const handleLoginSuccess = async (res) => {
    const accessToken = res.accessToken || res.data?.accessToken || res?.user?.accessToken;
    const refreshToken = res.refreshToken || res.data?.refreshToken || res?.user?.refreshToken;

    if (!accessToken) return;

    const decodedUser = parseJwt(accessToken);
    if (decodedUser) {
      const userRole = decodedUser.role || decodedUser.profile;
      let fullUserData = {
        ...decodedUser,
        role: userRole,
        accessToken,
        refreshToken
      };

      // Lưu token
      localStorage.setItem('authToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);

      // Gọi ngay profile để lấy tên thật cập nhật vào state
      try {
        const profileRes = await userService.getProfile();
        const profileData = profileRes.data || profileRes;
        fullUserData = { ...fullUserData, ...profileData };
      } catch (e) {
        console.log("Could not fetch profile immediately", e);
      }

      setUser(fullUserData);
      localStorage.setItem('currentUser', JSON.stringify(fullUserData));

      setIsLoginOpen(false);
      if (userRole?.toUpperCase() === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logoutService();
    } catch (e) {
      console.error('Logout error:', e);
    }
    localStorage.clear();
    setUser(null);
    setIsLoginOpen(false);
    navigate('/');
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setIsDesktop(width >= 1024);
      if (width >= 1024) {
        setIsSidebarOpen(true);
        setIsSidebarExpanded(false);
      } else {
        setIsSidebarOpen(false);
        setIsSidebarExpanded(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useAudio();

  const sidebarIcons = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Speaker, label: "Albums", path: "/albums" },
    { icon: Mic, label: "Artists", path: "/artists" },
    { icon: Folder, label: "Genres", path: "/genres" },
    { icon: Gem, label: "Top Tracks", path: "/top-tracks" },
    { type: 'divider' },
    { icon: Download, label: "Download", path: "/download" },
    { icon: Heart, label: "Favourite", path: "/favourite" },
    { icon: Crown, label: "Payment", path: "/payment" },
    { icon: History, label: "History", path: "/history" }
  ];

  // --- CẤU HÌNH MENU DROPDOWN (Đã sửa để hiển thị Tên thật) ---

  const userInfoItem = user ? {
    key: 'user-info',
    label: (
      <div className="px-3 py-2 cursor-default flex flex-col gap-0.5">
        {/* Ưu tiên hiển thị fullName từ API */}
        <div className="text-sm font-bold text-white">
          {user.fullName || user.full_name || user.name || "User"}
        </div>
        <div className="text-xs text-slate-400">
          {user.email || user.username}
        </div>
      </div>
    ),
    disabled: true,
    className: 'opacity-100 hover:bg-transparent cursor-default'
  } : null;

  const desktopMenuItems = user ? [
    userInfoItem,
    { key: 'divider0', type: 'divider', className: 'bg-cyan-500/20 my-1' },
    ...(user.role?.toUpperCase() === 'ADMIN' ? [{
      key: 'admin-dashboard',
      label: <span className="text-cyan-400 font-medium">Admin Dashboard</span>,
      onClick: () => navigate('/admin'),
      className: 'hover:bg-slate-700/50'
    }] : []),
    {
      key: 'profile',
      label: <span className="text-white">Profile</span>,
      onClick: () => navigate('/profile'),
      className: 'hover:bg-slate-700/50'
    },
    {
      key: 'settings',
      label: <span className="text-white">Settings</span>,
      onClick: () => navigate('/settings'),
      className: 'hover:bg-slate-700/50'
    },
    { key: 'divider1', type: 'divider', className: 'bg-cyan-500/20 my-1' },
    {
      key: 'logout',
      label: <span className="text-red-400 font-medium">Logout</span>,
      onClick: handleLogout,
      className: 'hover:bg-red-500/10'
    }
  ] : [];

  const mobileMenuItems = user ? [
    userInfoItem,
    { key: 'divider-mobile', type: 'divider', className: 'bg-cyan-500/20 my-1' },
    ...(user.role?.toUpperCase() === 'ADMIN' ? [{
      key: 'admin-dashboard',
      label: <span className="text-cyan-400 font-medium">Admin Dashboard</span>,
      onClick: () => {
        navigate('/admin');
        setIsSidebarOpen(false);
      },
      className: 'hover:bg-slate-700/50'
    }, { key: 'divider0', type: 'divider', className: 'bg-cyan-500/20 my-1' }] : []),
    {
      key: 'profile',
      label: <span className="text-white">Profile</span>,
      onClick: () => {
        navigate('/profile');
        setIsSidebarOpen(false);
      },
      className: 'hover:bg-slate-700/50'
    },
    {
      key: 'settings',
      label: <span className="text-white">Settings</span>,
      onClick: () => {
        navigate('/settings');
        setIsSidebarOpen(false);
      },
      className: 'hover:bg-slate-700/50'
    },
    { key: 'divider1', type: 'divider', className: 'bg-cyan-500/20 my-1' },
    {
      key: 'logout',
      label: <span className="text-red-400 font-medium">Logout</span>,
      onClick: handleLogout,
      className: 'hover:bg-red-500/10'
    }
  ] : [];

  const isPathActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white min-h-screen">
      {/* Header */}
      <header className={`fixed top-0 right-0 bg-slate-900/95 backdrop-blur-sm z-40 border-b border-cyan-500/20 transition-all duration-300 
        ${isDesktop && isSidebarOpen ? (isSidebarExpanded ? 'left-64' : 'left-20') : 'left-0'}
        ${isJamOpen ? 'mr-[350px]' : 'mr-0'}
      `}>
        <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <SearchBar />
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <select className="bg-transparent text-xs md:text-sm border-none focus:outline-none">
              <option>Language</option>
            </select>
            <button className="p-2 hover:bg-slate-800 rounded-full transition">
              <Bell className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              {!user ? (
                <>
                  <button
                    onClick={() => setIsRegisterOpen(true)}
                    className="hidden lg:block bg-[#00bcd4] px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-[#00acc1] transition-all"
                  >
                    Register
                  </button>
                  <button
                    onClick={() => setIsLoginOpen(true)}
                    className="hidden lg:block bg-[#00bcd4] px-3 sm:px-6 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium hover:bg-[#00acc1] transition-all"
                  >
                    Login
                  </button>
                  <button onClick={() => setIsRegisterOpen(true)} className="lg:hidden">
                    <Avatar size={36} icon={<UserAddOutlined />} className="bg-gradient-to-br from-green-400 to-emerald-500" />
                  </button>
                  <button onClick={() => setIsLoginOpen(true)} className="lg:hidden">
                    <Avatar size={36} icon={<LoginOutlined />} className="bg-gradient-to-br from-cyan-400 to-blue-500" />
                  </button>
                </>
              ) : (
                <div className="hidden lg:block">
                  <Dropdown
                    menu={{ items: desktopMenuItems }}
                    placement="bottomRight"
                    trigger={['click']}
                    popupRender={(menu) => (
                      <div className="bg-gradient-to-br from-cyan-800 to-blue-900 text-white rounded-xl shadow-2xl border border-transparent">
                        {menu}
                      </div>
                    )}
                    overlayClassName="user-dropdown"
                  >
                    <div className="cursor-pointer">
                      <Avatar size={40} icon={<UserOutlined />} className="bg-gradient-to-br from-cyan-400 to-blue-500" />
                    </div>
                  </Dropdown>
                </div>
              )}
            </div>
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-slate-800 rounded-lg transition lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-300 hover:text-white transition" />
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-slate-900/95 backdrop-blur-sm border-r border-cyan-500/20 flex flex-col py-6 z-50 transition-all duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } ${isDesktop ? (isSidebarExpanded ? 'w-64' : 'w-20') : 'w-64'}`}
      >
        <div
          onClick={() => navigate('/')}
          className={`flex items-center gap-3 mb-8 mt-4 cursor-pointer group transition-all duration-300 ${isDesktop && !isSidebarExpanded ? 'px-4 flex-col' : 'px-6 flex-row'
            }`}
        >
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center font-bold text-lg group-hover:shadow-lg transition flex-shrink-0">
            M
          </div>
          {(isSidebarExpanded || !isDesktop) && (
            <span className="text-sm font-medium text-white whitespace-nowrap overflow-hidden">
              The Miraculous
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 px-4 flex-1">
          {sidebarIcons.map((item, i) => {
            if (item.type === 'divider') {
              return <div key={i} className="my-1 border-t border-gray-500/100" />;
            }
            return (
              <button
                key={i}
                onClick={() => {
                  navigate(item.path);
                  if (!isDesktop) setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-xl transition ${isPathActive(item.path)
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400'
                  } ${isDesktop && !isSidebarExpanded ? 'px-2 py-2.5 justify-center' : 'px-4 py-2.5'}`}
                title={item.label}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {(isSidebarExpanded || !isDesktop) && (
                  <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
        {isDesktop && (
          <button
            onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
            className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-slate-800 border border-cyan-500/20 rounded-full flex items-center justify-center text-slate-400 hover:text-cyan-400 hover:bg-slate-700 transition"
          >
            {isSidebarExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
        {!isDesktop && user && (
          <div className="px-4 pt-4 border-t border-cyan-500/20">
            <Dropdown
              menu={{ items: mobileMenuItems }}
              placement="topRight"
              trigger={['click']}
              popupRender={(menu) => (
                <div className="bg-white text-slate-900 rounded-xl shadow-2xl border border-gray-200">
                  {menu}
                </div>
              )}
              overlayClassName="custom-dropdown"
            >
              <div className="cursor-pointer flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800 transition">
                <Avatar size={40} icon={<UserOutlined />} className="bg-gradient-to-br from-cyan-400 to-blue-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {user.fullName || user.full_name || user.name || user.username}
                  </div>
                  <div className="text-xs text-slate-400 truncate">{user.role}</div>
                </div>
              </div>
            </Dropdown>
          </div>
        )}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {!isDesktop && isSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 top-0" onClick={() => setIsSidebarOpen(false)} />
      )}

      <div
        className={`transition-all duration-300 pt-0 pb-24 
          ${isDesktop && isSidebarOpen ? (isSidebarExpanded ? 'ml-64' : 'ml-20') : 'ml-0'}
          ${isJamOpen ? 'mr-[350px]' : 'mr-0'}
        `}
      >
        <Outlet />
      </div>

      {/* Modals */}
      <RegisterPage
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onBack={() => {
          // Close register modal and open login modal
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
        onRegistered={() => {
          // After successful registration, close register and open login
          setIsRegisterOpen(false);
          setIsLoginOpen(true);
        }}
      />
      <LoginPage
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onBack={() => {
          // Close login modal and open register modal
          setIsLoginOpen(false);
          setIsRegisterOpen(true);
        }}
        onSuccess={handleLoginSuccess}
      />

      {/* Player Control */}
      <PlayerControl
        isSidebarOpen={isSidebarOpen}
        isSidebarExpanded={isSidebarExpanded}
        isDesktop={isDesktop}
        isJamOpen={isJamOpen}
        setIsJamOpen={setIsJamOpen}
      />
    </div>
  );
};

export default App;