import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, User, Check, Calendar, ArrowLeft } from 'lucide-react';
import userService from '../../services/userService';

const AddUserPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    gender: 'Other',
    address: '',
    joinDate: new Date().toISOString().split('T')[0],
    roleid: 'USER',
    avatar: '👤'
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [errors, setErrors] = useState({});

  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
  };

  const validatePhone = (phone) => {
    // Accept formats: +84... or 0... with 9-11 digits
    const re = /^(\+84|0)[0-9]{9,11}$/;
    return re.test(phone);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.email) {
      newErrors.email = 'Email là bắt buộc';
    } else if (!validateEmail(form.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    if (!form.name) {
      newErrors.name = 'Họ tên là bắt buộc';
    }

    if (!form.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    } else if (form.password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (form.phone && !validatePhone(form.phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ (định dạng: +84... hoặc 0... với 9-11 số)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setConfirmOpen(true);
    }
  };

  const handleConfirm = async () => {
    try {
      // Map form data to API expected format
      const userData = {
        email: form.email,
        name: form.name,
        password: form.password,
        phone: form.phone || null,
        gender: form.gender || null,
        address: form.address || null,
        dob: form.joinDate && form.joinDate.trim() !== '' ? form.joinDate : null,
        roleid: form.roleid || 'USER'
      };

      await userService.create(userData);
      navigate('/admin/users');
    } catch (error) {
      console.error("Error creating user:", error);
      const errorMessage = error.response?.data?.message || error.message || "Unknown error occurred";
      alert("Failed to create user: " + errorMessage);
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
            <span className="text-gray-900 font-medium">Create User</span>
          </nav>
        </div>

        <div className="bg-white rounded-b-xl border border-gray-200 shadow-sm -mt-3 overflow-hidden w-full min-h-[80vh]">
          <div className="p-10 h-full flex flex-col max-w-4xl mx-auto w-full">
            <form onSubmit={handleSubmit} className="space-y-6 flex-1 flex flex-col">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Enter full name"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="Enter email"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Enter password (min 6 characters)"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="Enter phone"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                  {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={form.joinDate}
                      onChange={(e) => setForm({ ...form, joinDate: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-gray-300 pl-10 pr-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={form.roleid}
                    onChange={(e) => setForm({ ...form, roleid: e.target.value })}
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    value={form.address}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    placeholder="Enter address"
                    className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-3 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-end gap-3 mt-auto">
                <Link to="/admin/users" className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">Cancel</Link>
                <button type="submit" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Create & Confirm</button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 shadow-2xl border border-gray-100">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold">Confirm new user information</h3>
                <p className="text-sm text-gray-500">Please review the details below before confirming creation.</p>
              </div>
              <button onClick={() => setConfirmOpen(false)} className="text-gray-500 hover:text-gray-700"><X /></button>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              <div className="flex items-center justify-center sm:justify-start">
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-purple-100 to-pink-50 flex items-center justify-center text-3xl shadow-sm">
                  {form.avatar || <User className="text-xl" />}
                </div>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-gray-500">Full name</div>
                    <div className="text-lg font-medium">{form.name || '—'}</div>
                    <div className="text-sm text-gray-500 mt-1">{form.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Active
                    </div>
                    <div className="mt-2">
                      <span className="inline-flex items-center rounded-full bg-purple-100 text-purple-800 px-2 py-1 text-sm font-medium">
                        {form.roleid === 'ADMIN' ? 'Admin' : 'User'}
                      </span>
                    </div>
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
                    <div className="text-xs text-gray-500">Gender</div>
                    <div className="font-medium">{form.gender || '—'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Date of Birth</div>
                    <div className="font-medium">{form.joinDate ? new Date(form.joinDate).toLocaleDateString('vi-VN') : '—'}</div>
                  </div>
                  <div className="sm:col-span-2">
                    <div className="text-xs text-gray-500">Address</div>
                    <div className="font-medium">{form.address || '—'}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3 justify-end">
              <button onClick={() => setConfirmOpen(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">Edit</button>
              <button onClick={handleConfirm} className="px-4 py-2 bg-purple-600 text-white rounded-md flex items-center gap-2 hover:bg-purple-700">
                <Check className="w-4 h-4" />
                Confirm & Create
              </button>
            </div>
          </div>
        </div>
      )}
      <br></br>
    </div>
  );
};

export default AddUserPage;