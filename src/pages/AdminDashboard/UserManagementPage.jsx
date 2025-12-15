import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Trash2, // Đã bỏ Edit2
  X,
  Check,
  UserCircle,
  Shield,
  Mail,
  Phone,
  Calendar,
  Clock,
  Filter,
  CheckCircle,
  AlertCircle,
  Lock,
  Unlock,
  AlertTriangle,
  Key // ✅ MỚI THÊM: Icon Reset Password
} from 'lucide-react';
import userService from '../../services/userService';

const CURRENT_ADMIN_ID = 1; 

const AdminUserManagement = () => {
  const hasProcessedRef = useRef(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); 
  const [filterRole, setFilterRole] = useState('All');
  const [filterStatus, setFilterStatus] = useState('All');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, type: '', user: null });
  const [deleteSupported, setDeleteSupported] = useState(true);

  const [formData, setFormData] = useState({
    username: '',
    name: '',
    email: '',
    phone: '',
    password: '', 
    role: 'User',
    status: 'Active',
    avatar: '👤'
  });
  const [validationErrors, setValidationErrors] = useState({});
  // Allowed public email domains (case-insensitive)
  const allowedEmailDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com', 'aol.com', 'msn.com', 'protonmail.com', 'yandex.com', 'mail.com'
  ];

  // Password validator same as RegisterPage: min 8 chars, 1 uppercase, 1 number, 1 special char
  const validatePassword = (pwd) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pwd || '');
  };

  // --- HELPER FUNCTIONS ---
  const getRoleColor = (role) => {
    const r = role ? role.toString().toUpperCase() : '';
    if (r === 'ADMIN') return 'bg-purple-50 text-purple-600 border-purple-200';
    return 'bg-blue-50 text-blue-600 border-blue-200';
  };

  const getStatusColor = (status) => {
    const s = status ? status.toString().toUpperCase() : '';
    if (s === 'ACTIVE') return 'bg-green-50 text-green-600 border-green-200';
    if (s === 'LOCKED' || s === 'BLOCKED') return 'bg-red-50 text-red-600 border-red-200';
    return 'bg-gray-50 text-gray-600 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const s = status ? status.toString().toUpperCase() : '';
    if (s === 'ACTIVE') return CheckCircle;
    if (s === 'LOCKED' || s === 'BLOCKED') return Lock;
    return AlertCircle;
  };

  // --- LOAD DỮ LIỆU TỪ API (ĐÃ SỬA) ---
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAll();
      
      // 🔥 DEBUG: Bật F12 -> Console để xem API thực sự trả về cái gì
      console.log('📦 RAW API RESPONSE:', response);

      // Lấy mảng data (xử lý nhiều trường hợp response khác nhau)
      const rawData = response.items || response.data || response || [];

      if (!Array.isArray(rawData)) {
        console.error("❌ Dữ liệu nhận được không phải là mảng:", rawData);
        setUsers([]);
        return;
      }

      const mappedUsers = rawData.map(u => {
        // 1. Xử lý Role: Kiểm tra cả 'role' lẫn 'roleId'
        // (API create bắt dùng roleId, nên khả năng cao get cũng trả về roleId)
        const rawRole = u.role || u.roleId || ''; 
        let uiRole = 'User';
        
        // Chuyển về chữ hoa để so sánh cho chính xác
        if (rawRole && rawRole.toString().toUpperCase() === 'ADMIN') {
            uiRole = 'Admin';
        }

        // 2. Xử lý Status
        const rawStatus = u.status || '';
        let uiStatus = 'Active'; // Mặc định là Active nếu không tìm thấy status
        
        if (rawStatus) {
            const s = rawStatus.toString().toUpperCase();
            if (s === 'BLOCKED' || s === 'LOCKED') uiStatus = 'Locked';
            else if (s === 'INACTIVE') uiStatus = 'Inactive';
            else if (s === 'ACTIVE') uiStatus = 'Active';
        }

        // 3. Xử lý hiển thị Tên
        const displayName = u.fullName || u.full_name || u.name || u.email?.split('@')[0] || 'Unknown User';
        
        // 4. Xử lý Phone
        const displayPhone = u.phoneNumber || u.phone || 'N/A';

        return {
          ...u,
          name: displayName,
          username: u.username || (u.email ? u.email.split('@')[0] : 'user'),
          email: u.email || 'No Email',
          phone: displayPhone,
          avatar: u.avatar || '👤',
          role: uiRole,    // Dùng giá trị đã xử lý
          status: uiStatus, // Dùng giá trị đã xử lý
          joinDate: u.created_at || new Date().toISOString(),
          lastLogin: u.last_login || 'Never',
        };
      });

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Xử lý navigation state
  useEffect(() => {
    if (location && location.state) {
      if (location.state.newUser) {
        window.location.reload();
      }
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const filteredUsers = users.filter(user => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (user.name && user.name.toLowerCase().includes(q)) ||
      (user.email && user.email.toLowerCase().includes(q)) ||
      (user.username && user.username.toLowerCase().includes(q));
    const matchesRole = filterRole === 'All' || user.role === filterRole;
    const matchesStatus = filterStatus === 'All' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const pageSize = 10;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / pageSize));

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterRole, filterStatus, users.length]);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const handleOpenModal = (mode, user = null) => {
    // Logic view user
    if (user && mode === 'edit' && ((user.role === 'Admin' && user.id !== CURRENT_ADMIN_ID) || user.status === 'Locked')) {
      setModalMode('view');
      setSelectedUser(user);
      setFormData({});
      setIsModalOpen(true);
      return;
    }

    setModalMode(mode);
    if (user) {
      setSelectedUser(user);
      // Logic edit đã bị ẩn nút gọi, nhưng giữ code để không lỗi logic
      if (mode === 'edit') {
        setFormData({
          username: user.username,
          name: user.name,
          email: user.email || '',
          phone: user.phone,
          password: '', 
          role: user.role,
          status: user.status || 'Active',
          avatar: user.avatar || '👤'
        });
      }
    } else {
      setSelectedUser(null);
      setFormData({
        username: '',
        name: '',
        email: '',
        phone: '',
        password: '',
        role: 'User',
        status: 'Active',
        avatar: '👤'
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
    setValidationErrors({});
  };

  // --- ✅ MỚI THÊM: XỬ LÝ RESET PASSWORD ---
  // --- UPDATED HANDLE RESET PASSWORD (ENGLISH & DEBUGGING) ---
  const handleResetPassword = async (user) => {
    if (window.confirm(`Are you sure you want to reset the password for user ${user.name}?`)) {
      try {
        const res = await userService.resetPassword(user.id);
        
        // Check the Console (F12) to see what the server actually returns
        console.log("📦 Reset Password Response:", res); 

        // logic to check if server sends back the new password
        const newPass = res?.newPassword || res?.data?.newPassword || res?.message;
        
        if (newPass && typeof newPass === 'string' && newPass.length > 5) {
             alert(`Success! The new password is: ${newPass}`);
        } else {
             // If server doesn't return the password, suggest the likely defaults based on your code
             alert(`Password reset successfully. Please try logging in with: "User@123456" or "DefaultPassword@123"`);
        }

      } catch (error) {
        console.error('Error resetting password:', error);
        alert('Failed to reset password. Please try again.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modalMode === 'add') {
        // Validate phone: must be 10 digits and start with 0
        const phone = (formData.phone || '').toString().trim();
        const phoneValid = /^0\d{9}$/.test(phone);

        // Validate email format and domain against allowed list
        const email = (formData.email || '').toString().trim();
        const basicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(email);
        let emailValid = false;
        if (basicFormat) {
          const domain = email.split('@').pop().toLowerCase();
          emailValid = allowedEmailDomains.includes(domain);
        }

        // Validate password using same rules as registration
        const password = (formData.password || '').toString();
        const passwordProvided = password.length > 0;
        const passwordValid = validatePassword(password);

        // Check if email already exists (try to query server)
        let emailExists = false;
        if (emailValid) {
          try {
            const resp = await userService.getAll({ email });
            const list = resp?.items || resp?.data || resp || [];
            if (Array.isArray(list) && list.length > 0) {
              // Only treat as existing if there's an exact email match (case-insensitive)
              const match = list.some(u => (u.email || '').toString().toLowerCase() === email.toLowerCase());
              emailExists = !!match;
            }
          } catch (err) {
            // ignore network errors here, server might not support filtering
            console.warn('Could not verify email uniqueness', err);
          }
        }

        // Collect validation errors per field
        const vErrors = {};
        if (!phoneValid) vErrors.phone = 'Phone number invalid: must be 10 digits and start with 0.';
        if (!emailValid) vErrors.email = `Email invalid: please use an address with one of the allowed domains: ${allowedEmailDomains.join(', ')}.`;
        if (emailValid && emailExists) vErrors.email = 'Email already exists: please use a different email.';
        // Require password and validate its strength
        if (!passwordProvided) vErrors.password = 'Password is required. Please provide a password.';
        else if (!passwordValid) vErrors.password = 'Password must contain 8+ chars, uppercase, number & special char.';

        if (Object.keys(vErrors).length > 0) {
          setValidationErrors(vErrors);
          return;
        }

        const newUserData = {
          ...formData,
          email: email || `${formData.username}@example.com`,
        };

        await userService.create(newUserData);
        alert('User created successfully');
        fetchUsers(); // Refresh list instead of reload

      } else if (modalMode === 'edit' && selectedUser) {
        // Edit is disabled in UI; keep this as a safeguard
        alert('Edit feature is disabled for Admin');
      }
      handleCloseModal();
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Please try again.');
    }
  };

  const handleConfirmAction = (type, user) => {
    if (!user) return;
    if (type === 'lock' && user.status === 'Locked') return alert('User already locked');
    if (type === 'unlock' && user.status !== 'Locked') return alert('User is not locked');

    setConfirmModal({ isOpen: true, type, user });
  };

  const handleExecuteAction = async () => {
    const { type, user } = confirmModal;
    if (!user) return;

    try {
      switch (type) {
        case 'delete':
          try {
            await userService.delete(user.id);
            setUsers(prev => prev.filter(u => u.id !== user.id));
          } catch (err) {
            const status = err?.response?.status;
            // If API doesn't support delete, disable delete UI
            if (status === 404 || status === 405) {
              setDeleteSupported(false);
              alert('Delete API not supported on server. Delete option has been disabled.');
            } else {
              throw err;
            }
          }
          break;

        case 'lock':
          await userService.blockUser(user.id); // Gọi đúng tên hàm trong userService mới
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Locked' } : u));
          alert(`User ${user.name} has been blocked successfully.`);
          break;

        case 'unlock':
          await userService.activateUser(user.id); // Gọi đúng tên hàm trong userService mới
          setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'Active' } : u));
          alert(`User ${user.name} has been activated.`);
          break;
      }
      setConfirmModal({ isOpen: false, type: '', user: null });
    } catch (error) {
      console.error(`Error ${type}ing user:`, error);
      const msg = error.response?.data?.message || `Failed to ${type} user`;
      alert(msg);
    }
  };
  
  // Permissions
  const canDelete = (user) => {
    if (!user) return false;
    if (user.id === CURRENT_ADMIN_ID) return false; // don't allow deleting yourself
    if (user.role === 'Admin') return false; // don't allow deleting other admins

    // Allow deleting locked users (e.g., test16) but prevent deleting accounts
    // that are already deleted/marked blocked at the DB level.
    if (user.deleted_at || user.deletedAt || user.isBlocked || user.is_blocked || user.blocked === true) return false;

    return true;
  };
  const canLockUnlock = (user) => user.id !== CURRENT_ADMIN_ID && user.role !== 'Admin';
  const canResetPassword = (user) => user.id !== CURRENT_ADMIN_ID; // ✅ Ai cũng reset được trừ chính mình

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 md:p-6 lg:p-8">
        <div className="max-w-full mx-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
              <p className="text-gray-600">Manage and monitor user accounts</p>
            </div>
            <button
              onClick={() => handleOpenModal('add')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 justify-center shadow-lg shadow-purple-500/30"
            >
              <Plus className="w-5 h-5" />
              Add New User
            </button>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" placeholder="Search users..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 text-gray-900 pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200" />
              </div>
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="bg-white text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none shadow-sm">
                <option value="All">All Roles</option>
                <option value="Admin">Admin</option>
                <option value="User">User</option>
              </select>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="bg-white text-gray-900 px-4 py-2.5 rounded-lg border border-gray-300 focus:border-purple-500 focus:outline-none shadow-sm">
                <option value="All">All Status</option>
                <option value="Active">Active</option>
                <option value="Locked">Locked</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">User</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Role</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.length > 0 ? (
                    paginatedUsers.map((user, idx) => {
                      const StatusIcon = getStatusIcon(user.status);
                      return (
                        <tr key={user.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-100 hover:bg-gray-100 transition`}>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl text-white">{user.avatar}</div>
                              <div>
                                <div className="font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">@{user.username}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="text-sm text-gray-700">{user.email}</div>
                            <div className="text-xs text-gray-500">{user.phone}</div>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>{user.role}</span>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                              <StatusIcon className="w-3 h-3" /> {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {/* Nút View */}
                              <button onClick={() => handleOpenModal('view', user)} className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600 hover:text-purple-600" title="View"><UserCircle className="w-4 h-4" /></button>
                              
                              {/* ❌ ĐÃ BỎ NÚT EDIT */}
                              
                              {/* ✅ MỚI THÊM: NÚT RESET PASSWORD */}
                              {canResetPassword(user) && (
                                <button onClick={() => handleResetPassword(user)} className="p-2 hover:bg-gray-200 rounded-lg transition text-gray-600 hover:text-yellow-600" title="Reset Password">
                                  <Key className="w-4 h-4" />
                                </button>
                              )}

                              {/* Nút Lock/Unlock */}
                              {canLockUnlock(user) && <button onClick={() => handleConfirmAction(user.status === 'Locked' ? 'unlock' : 'lock', user)} className={`p-2 hover:bg-gray-200 rounded-lg transition ${user.status === 'Locked' ? 'text-green-600' : 'text-orange-600'}`} title={user.status === 'Locked' ? 'Unlock' : 'Lock'}>{user.status === 'Locked' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}</button>}
                              
                              
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="5" className="py-8 text-center text-gray-500">No users found matching your criteria</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
<div className="max-w-7xl mx-auto mt-4 px-4 md:px-6 lg:px-8 pb-8">
  <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">

    {/* Info text */}
    <div className="text-sm text-gray-600">
      {filteredUsers.length === 0
        ? 'No users'
        : `Showing ${(currentPage - 1) * pageSize + 1} to ${Math.min(
            currentPage * pageSize,
            filteredUsers.length
          )} of ${filteredUsers.length} users — Page ${currentPage} / ${totalPages}`}
    </div>

    {/* Page number navigation */}
    <div className="flex items-center gap-2 flex-wrap justify-center">

      {/* Prev */}
      <button
        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
        disabled={currentPage === 1}
        className={`px-3 py-1 rounded-md border ${
          currentPage === 1
            ? 'text-gray-400 border-gray-200'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Prev
      </button>

      {/* Page numbers */}
      {[...Array(totalPages)].map((_, i) => {
        const page = i + 1;
        return (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={`px-3 py-1 rounded-md border text-sm ${
              currentPage === page
                ? 'bg-purple-600 text-white border-purple-600'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {page}
          </button>
        );
      })}

      {/* Next */}
      <button
        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
        disabled={currentPage === totalPages}
        className={`px-3 py-1 rounded-md border ${
          currentPage === totalPages
            ? 'text-gray-400 border-gray-200'
            : 'text-gray-700 border-gray-300 hover:bg-gray-50'
        }`}
      >
        Next
      </button>

    </div>
  </div>
</div>


          {/* Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="relative w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-white">
                <button onClick={handleCloseModal} className="absolute top-3 right-3 p-2 text-gray-500 hover:text-gray-700 rounded-md"><X className="w-5 h-5" /></button>
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                  {modalMode === 'view' ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
                      <div className="col-span-1 flex items-center justify-center"><div className="w-32 h-32 md:w-36 md:h-36 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-5xl text-white shadow-lg">{selectedUser?.avatar}</div></div>
                      <div className="col-span-2">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">{selectedUser?.name}</div>
                        <div className="text-sm text-gray-500 mt-1">@{selectedUser?.username}</div>
                        <div className="mt-3 flex items-center gap-2">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getRoleColor(selectedUser?.role)}`}>{selectedUser?.role}</span>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedUser?.status)}`}>{selectedUser?.status}</span>
                        </div>
                        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div className="p-4 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Email</div><div className="font-medium break-words">{selectedUser?.email || '—'}</div></div>
                          <div className="p-4 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Phone</div><div className="font-medium">{selectedUser?.phone || '—'}</div></div>
                          <div className="p-4 bg-gray-50 rounded-lg"><div className="text-xs text-gray-500">Join date</div><div className="font-medium">{selectedUser?.joinDate ? new Date(selectedUser.joinDate).toLocaleDateString() : '—'}</div></div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <h2 className="text-xl font-semibold text-gray-800">{modalMode === 'add' ? 'Add New User' : 'Edit User'}</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {modalMode === 'add' && (
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                            <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} placeholder="Enter username" className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition" required />
                          </div>
                        )}
                        <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter full name" className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition" /></div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => { setFormData({ ...formData, email: e.target.value }); setValidationErrors(prev => ({ ...prev, email: null })); }}
                            disabled={modalMode === 'edit'}
                            placeholder="Enter email address"
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition"
                          />
                          {validationErrors.email && <p className="text-sm text-red-500 mt-1">{validationErrors.email}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                          <input
                            type="text"
                            value={formData.phone}
                            onChange={(e) => { setFormData({ ...formData, phone: e.target.value }); setValidationErrors(prev => ({ ...prev, phone: null })); }}
                            placeholder="Enter phone number"
                            className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition"
                          />
                          {validationErrors.phone && <p className="text-sm text-red-500 mt-1">{validationErrors.phone}</p>}
                        </div>

                        {modalMode === 'add' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                              type="text"
                              value={formData.password}
                              onChange={(e) => { setFormData({ ...formData, password: e.target.value }); setValidationErrors(prev => ({ ...prev, password: null })); }}
                              placeholder="Enter password"
                              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition"
                            />
                            {validationErrors.password && <p className="text-sm text-red-500 mt-1">{validationErrors.password}</p>}
                            <p className="text-xs text-gray-500 mt-1">* Requires: 8 chars, uppercase, number & special char.</p>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition shadow-sm"
                          >
                            <option value="User">User</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                          <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none transition shadow-sm">
                            <option value="Active">Active</option>
                            <option value="Locked">Locked</option>
                          </select>
                        </div>
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button type="button" onClick={handleCloseModal} className="px-5 py-2.5 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition">Cancel</button>
                        <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition">{modalMode === 'add' ? 'Create User' : 'Save Changes'}</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Confirm Modal */}
          {confirmModal.isOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{confirmModal.type === 'delete' ? 'Delete User' : confirmModal.type === 'lock' ? 'Lock User' : 'Unlock User'}</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to perform this action?</p>
                <div className="flex gap-3 justify-end">
                  <button onClick={() => setConfirmModal({ isOpen: false, type: '', user: null })} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                  <button onClick={handleExecuteAction} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Confirm</button>
                </div>
              </div>
            </div>
          )}

          {/* validationErrors are displayed inline under fields */}
        </div>
      </div>
    </div>
  );
};   

export default AdminUserManagement;