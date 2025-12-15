import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { X, User, Check, Calendar, ArrowLeft } from 'lucide-react';
import userService from '../../services/userService';

const EditUserPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const [form, setForm] = useState({
    id: null,
    username: '',
    name: '',
    email: '',
    phone: '',
    gender: 'Other',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    role: 'User',
    status: 'Active',
    avatar: '👤'
  });
  const [errors, setErrors] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (location?.state?.user) {
        setForm(prev => ({ ...prev, ...location.state.user }));
        return;
      }

      try {
        const user = await userService.getById(id);
        setForm({
          ...form,
          id: user.id,
          username: user.email?.split('@')[0] || 'user',
          name: user.full_name,
          email: user.email,
          phone: user.phone_number || '',
          gender: user.gender || 'Other',
          address: user.address || '',
          joinDate: user.created_at?.split('T')[0] || form.joinDate,
          role: user.role || 'User',
          status: user.status === 'ACTIVE' ? 'Active' : 'Blocked'
        });
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    loadUser();
  }, [id, location]);

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    const re = /^(\+84|0)[0-9]{9,11}$/;
    return re.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};
    if (form.phone && !validatePhone(form.phone)) newErrors.phone = 'Invalid phone number';
    if (form.email && !validateEmail(form.email)) newErrors.email = 'Invalid email';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setConfirmOpen(true);
  };

  const handleConfirm = async () => {
    try {
      const mutable = {
        name: form.name,
        phone: form.phone,
        gender: form.gender,
        address: form.address,
        role: form.role,
        joinDate: form.joinDate
      };

      await userService.update(form.id, mutable);
      navigate('/admin/users');
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user: " + error.message);
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="w-full mx-0 px-6 md:px-8 relative">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-gray-900">User Management</h1>
              <p className="text-xs sm:text-sm text-gray-600 mt-1">Manage and monitor user accounts</p>
            </div>
            <Link
              to="/admin/users"
              className="flex items-center gap-2 text-xs sm:text-sm text-gray-700 bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg hover:bg-white transition border border-gray-200 shadow-sm"
              aria-label="Back to Users"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Users</span>
            </Link>
          </div>

          {/* Breadcrumb */}
          <nav className="text-xs sm:text-sm text-gray-500 flex items-center flex-wrap gap-1">
            <Link to="/admin" className="hover:underline hover:text-gray-700">Admin</Link>
            <span>/</span>
            <Link to="/admin/users" className="hover:underline hover:text-gray-700">User Management</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Edit User</span>
          </nav>
        </div>

        <div className="bg-gradient-to-r from-purple-600 to-pink-500 rounded-t-xl text-white px-6 py-4 shadow-md">
          <div className="flex items-center justify-between w-full">
            <div>
              <h2 className="text-lg font-semibold">Edit User</h2>
              <p className="text-sm opacity-90">Update the user details below and confirm.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm -mt-3 overflow-hidden w-full min-h-[80vh]">
          <div className="p-10 h-full flex flex-col max-w-4xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  <input value={form.username} disabled className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-100 text-sm cursor-not-allowed" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Full name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input value={form.email} disabled className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-100 text-sm cursor-not-allowed" />
                  <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm" />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm">
                    <option value="Other">Other</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Join date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="date" value={form.joinDate} onChange={(e) => setForm({ ...form, joinDate: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 bg-gray-50 text-sm" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm">
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-auto">
                <Link to="/admin/users" className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">Cancel</Link>
                <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg">Update & Confirm</button>
              </div>
            </form>
          </div>
        </div>

        {confirmOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Confirm update</h3>
                  <p className="text-sm text-gray-500">Please review the information before confirming the update.</p>
                </div>
                <button onClick={() => setConfirmOpen(false)} className="text-gray-500 hover:text-gray-700"><X /></button>
              </div>

              <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
                <div className="flex items-center justify-center sm:justify-start">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-100 to-pink-50 flex items-center justify-center text-3xl shadow-sm">{form.avatar || <User />}</div>
                </div>
                <div className="sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs text-gray-500">Full name</div>
                      <div className="text-lg font-medium">{form.name || '—'}</div>
                      <div className="text-sm text-gray-500 mt-1">@{form.username || '—'}</div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${form.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{form.status}</div>
                      <div className="mt-2"><span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-1 text-sm font-medium">{form.role}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="font-medium">{form.email || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="font-medium">{form.phone || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Join date</div>
                      <div className="font-medium">{form.joinDate ? new Date(form.joinDate).toLocaleDateString('en-US') : '—'}</div>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs text-gray-500">Gender</div>
                      <div className="font-medium">{form.gender || '—'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Address</div>
                      <div className="font-medium break-words">{form.address || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
                <button onClick={handleConfirm} className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center gap-2 hover:bg-purple-700"><Check className="w-4 h-4" />Confirm Update</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditUserPage;
