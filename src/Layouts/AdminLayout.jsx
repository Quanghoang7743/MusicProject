// 1. Thêm import useEffect
import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Music, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  Mic,
  Disc,
  FolderOpen
} from 'lucide-react';
import { Avatar, Dropdown } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { Package } from 'lucide-react';
// 2. Import userService (đường dẫn có thể khác tuỳ cấu trúc folder, giả sử cùng cấp App)
import userService from '../services/userService'; 

const AdminLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // 3. Chuyển User thành State để có thể cập nhật tên
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    return savedUser ? JSON.parse(savedUser) : { name: "", email: "", username: "" };
  });

  // 4. Thêm useEffect để fetch tên thật từ API
  useEffect(() => {
    const fetchAdminProfile = async () => {
        try {
            // Kiểm tra token trước khi gọi
            if (localStorage.getItem('authToken')) {
                const res = await userService.getProfile();
                const profileData = res.data || res;
                setUser(prev => ({ ...prev, ...profileData }));
            }
        } catch (error) {
            console.error("Failed to fetch admin profile", error);
        }
    };
    fetchAdminProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isLoggedInAdmin');
    localStorage.removeItem('isLoggedInUser');
    localStorage.removeItem('authToken'); // Xoá luôn token
    navigate('/');
  };

  // --- CẬP NHẬT MENU ITEMS CHO ADMIN ---
  const menuItems = [
    {
      key: 'user-info',
      label: (
        <div className="px-2 py-1 cursor-default flex flex-col gap-0.5">
          {/* Display the user's name dynamically */}
          <div className="text-sm font-bold text-gray-900">
            {/* Ưu tiên fullName/full_name */}
            {user?.fullName || user?.full_name || user?.name || "Admin"}
          </div>
          {/* Display the user's email or username */}
          <div className="text-xs text-gray-500">
            {user?.email || user?.username}
          </div>
        </div>
      ),
      disabled: true, 
      className: '!opacity-100 !cursor-default' 
    },
    { 
      type: 'divider' 
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
      danger: true,
      icon: <LogOut className="w-4 h-4" />
    }
  ];

  // ... (Phần code bên dưới giữ nguyên) ...
  const adminMenuItems = [
    { icon: LayoutDashboard, label: "Admin Dashboard", path: "/admin" },
    { icon: Users, label: "User Management", path: "/admin/users" },
    { icon: Music, label: "Song Management", path: "/admin/songs" },
    { icon: Disc, label: "Album Management", path: "/admin/albums" },
    { icon: FolderOpen, label: "Genre Management", path: "/admin/genres" },
    { icon: Mic, label: "Artist Management", path: "/admin/artists" },
    { icon: Package, label: "Service Packages", path: "/admin/packages" },
    { icon: Settings, label: "Settings", path: "/admin/settings" }
  ];

  const isPathActive = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 shadow-sm">
        <div className="px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-purple-500/30">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
                <p className="text-xs text-gray-500">The Miraculous</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Dropdown menu={{ items: menuItems }} placement="bottomRight" trigger={['click']}>
              <div className="cursor-pointer flex items-center gap-3 hover:bg-gray-100 rounded-lg p-2 transition">
                <div className="hidden md:block text-right">
                  {/* Cập nhật hiển thị tên ở đây nữa */}
                  <div className="text-sm font-medium text-gray-900">
                      {user?.fullName || user?.full_name || user?.name || "Admin"}
                  </div>
                  <div className="text-xs text-gray-500">{user?.role}</div>
                </div>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  className="bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg shadow-purple-500/30"
                  style={{ border: '2px solid #9333ea' }}
                />
              </div>
            </Dropdown>
          </div>
        </div>
      </header>

      {/* Admin Sidebar */}
      <aside
        className={`fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 z-40 pt-20 transition-all duration-300 shadow-lg ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 w-64`}
      >
        <nav className="p-4 space-y-2">
          {adminMenuItems.map((item, i) => {
            const active = isPathActive(item.path);
            return (
              <button
                key={i}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium ${
                  active
                    ? 'bg-purple-50 text-purple-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-purple-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Back to User Site */}
        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-cyan-50 text-cyan-600 hover:bg-cyan-100 transition font-medium shadow-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Back to Music App</span>
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="pt-20 lg:pl-64 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;