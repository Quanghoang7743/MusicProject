import React, { useEffect, useRef, useState } from "react";
import { Camera, Loader, User, Calendar, MapPin, Phone, Mail, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import userService from "../../services/userService";
import packageService from "../../services/packageService";
import { useNavigate } from "react-router-dom";

const formatDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-US");
  } catch {
    return iso;
  }
};

const formatInputDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toISOString().split('T')[0];
  } catch {
    return "";
  }
};

// Helper function to calculate days left
const calculateDaysLeft = (expiresAt) => {
  if (!expiresAt) return 0;
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Helper function to format date nicely
const formatDateNice = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

// compute expiresAt (ISO) from today + days
const expiresFromToday = (days) => {
  const d = new Date();
  // normalize to midnight so "days left" is whole days
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + Number(days));
  return d.toISOString();
};


export default function ProfilePage() {
  const navigate = useNavigate();
  const avatarFileRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("personal");

  // State Plans
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);

  // State Subscription
  const [userSubscription, setUserSubscription] = useState(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);

  // Form State - Personal
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    gender: "Other",
    dob: "",
    avatar: ""
  });

  // Form State - Security
  const [securityData, setSecurityData] = useState({
    currentPwd: "",
    newPwd: "",
    confirmPwd: "",
    twoFaEnabled: false
  });

  // State quản lý việc ẩn/hiện password
  const [showPwdMap, setShowPwdMap] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // Hàm toggle hiển thị pass
  const toggleShowPwd = (field) => {
    setShowPwdMap(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // Load User Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await userService.getProfile();
        const data = res.data || res;

        setUser(data);

        const dayLeft = data?.plan?.dayLeft;
        if (typeof dayLeft === "number" && !isNaN(dayLeft)) {
          const startDate = new Date().toISOString();
          const expiresAt = expiresFromToday(dayLeft);

          setUserSubscription({
            plan: {
              name: data.plan.name || data.planName || "Premium",
              price: data.plan.price || 0,
              duration: data.plan.duration || dayLeft,
              features: data.plan.features || []
            },
            startDate,
            expiresAt,
            dayLeft
          });
        }

        setFormData({
          fullName: data.fullName || data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          gender: data.gender || "Other",
          dob: data.dob ? formatInputDate(data.dob) : "",
          avatar: data.avatar || ""
        });

        setSecurityData(prev => ({ ...prev, twoFaEnabled: false }));

      } catch (error) {
        console.error("Failed to load profile", error);
        if (error.response && error.response.status === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Load Plans
  useEffect(() => {
    if (activeTab === 'plan' && plans.length === 0) {
      const fetchPlans = async () => {
        try {
          setLoadingPlans(true);
          const res = await packageService.getAll();

          let fetchedPlans = [];
          if (Array.isArray(res)) fetchedPlans = res;
          else if (res?.items && Array.isArray(res.items)) fetchedPlans = res.items;
          else if (res?.data && Array.isArray(res.data)) fetchedPlans = res.data;

          const mappedPlans = fetchedPlans.map(pkg => ({
            id: pkg.id || pkg.planId,
            name: pkg.name,
            price: parseFloat(pkg.price) || 0,
            duration: parseInt(pkg.duration) || 30,
            type: pkg.type,
            features: Array.isArray(pkg.features) && pkg.features.length > 0
              ? pkg.features
              : (pkg.description || '').split('\n').filter(line => line.trim().length > 0)
          }));

          setPlans(mappedPlans);
          if (mappedPlans.length > 0) setSelectedPlanId(mappedPlans[0].id);

        } catch (error) {
          console.error("Failed to load plans:", error);
        } finally {
          setLoadingPlans(false);
        }
      };
      fetchPlans();
    }
  }, [activeTab, plans.length]);

  // Load Subscription
  useEffect(() => {
    if (activeTab === 'plan') {
      const fetchSubscription = async () => {
        try {
          setLoadingSubscription(true);
          const subscription = await userService.getUserSubscription();
          console.log('✅ User subscription:', subscription);
          setUserSubscription(subscription);
        } catch (error) {
          console.error('❌ Error loading subscription:', error);
          setUserSubscription(null);
        } finally {
          setLoadingSubscription(false);
        }
      };

      fetchSubscription();
    }
  }, [activeTab]);

  // --- VALIDATION PASSWORD ---
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(password);
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setFormData(prev => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarClick = () => {
    if (avatarFileRef.current) avatarFileRef.current.click();
  };

  const savePersonal = async () => {
    try {
      await userService.updateProfile({
        fullName: formData.fullName,
        phone: formData.phone,
        address: formData.address,
        gender: formData.gender,
        dob: formData.dob
      });
      alert("Profile updated successfully! 🎉");
      setUser(prev => ({ ...prev, ...formData }));
    } catch (error) {
      console.error(error);
      alert("Failed to update profile: " + (error.response?.data?.message || error.message));
    }
  };

  // --- SAVE SECURITY ---
  const saveSecurity = async () => {
    const { currentPwd, newPwd, confirmPwd } = securityData;

    if (newPwd) {
      if (!currentPwd) {
        return alert("Please enter your current password to confirm changes.");
      }
      if (currentPwd === newPwd) {
        return alert("New password cannot be the same as your current password!");
      }
      if (newPwd !== confirmPwd) {
        return alert("New password and confirmation do not match.");
      }
      if (!validatePassword(newPwd)) {
        return alert("New password is too weak. It must contain at least 8 chars, 1 uppercase, 1 number, and 1 special char.");
      }

      try {
        await userService.updatePassword({
          oldPassword: currentPwd,
          newPassword: newPwd
        });
        alert("Password updated successfully! Please login again.");
        setSecurityData(prev => ({ ...prev, currentPwd: "", newPwd: "", confirmPwd: "" }));
      } catch (error) {
        console.error(error);
        const data = error.response?.data;
        const msg = data?.message;

        if (msg === 'sv_err_invalid_password') {
          alert("The Current Password you entered is incorrect. Please check again!");
        } else if (msg === 'sv_err_weak_password') {
          alert("New password is not strong enough.");
        } else {
          alert(msg || "Failed to update password. Please check your connection.");
        }
      }
    } else {
      alert("No changes to save.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-cyan-400">
        <Loader className="animate-spin w-10 h-10" />
      </div>
    );
  }

  const computedDaysLeft = user?.plan?.dayLeft ?? (userSubscription?.expiresAt ? calculateDaysLeft(userSubscription.expiresAt) : 0);

  const computedExpiresAt = user?.plan?.dayLeft != null
    ? expiresFromToday(user.plan.dayLeft)
    : (userSubscription?.expiresAt || null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-20 md:pt-24 pb-0 md:pb-0 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Profile Settings
          </h1>
          <p className="text-slate-400">Manage your account details and preferences</p>
        </div>

        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 mb-6 border border-cyan-500/20">
          <div className="flex items-center gap-6">
            <div
              className="relative w-24 h-24 rounded-full overflow-hidden bg-slate-700 border-2 border-cyan-500/50 flex-shrink-0 cursor-pointer group"
              onClick={handleAvatarClick}
            >
              <input
                ref={avatarFileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files && e.target.files[0])}
              />

              {formData.avatar ? (
                <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-cyan-400">
                  {formData.fullName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "U"}
                </div>
              )}

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white mb-1">
                {formData.fullName || "User"}
              </h2>
              <p className="text-cyan-400 mb-2 flex items-center gap-2">
                <Mail size={14} /> {user?.email}
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-sm border border-cyan-500/30 capitalize">
                  {user?.role?.toLowerCase() || "user"}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm border ${user?.isVerified ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'}`}>
                  {user?.isVerified ? "Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {['personal', 'plan', 'security'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap capitalize ${activeTab === tab
                ? "bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                }`}
            >
              {tab === 'plan' ? 'Subscription Plans' : tab + ' Info'}
            </button>
          ))}
        </div>

        {/* --- PERSONAL INFO TAB --- */}
        {activeTab === "personal" && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 animate-in fade-in duration-300">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <User className="w-5 h-5" /> Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="w-full p-3 rounded-lg bg-slate-900/50 border border-slate-700 text-slate-400 cursor-not-allowed"
                  value={formData.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Date of Birth</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full p-3 pl-10 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                    value={formData.dob}
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                    placeholder="Select your date of birth"
                    min="1900-01-01"
                    max="2100-12-31"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"/>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button onClick={savePersonal} className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-white">
                Save Changes
              </button>
            </div>
          </div>
        )}

        {/* --- PLAN TAB --- */}
        {activeTab === "plan" && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 animate-in fade-in duration-300">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400">Subscription Plans</h3>

            {/* Active Subscription Card */}
            {loadingSubscription ? (
              <div className="bg-slate-900/40 rounded-xl p-6 border border-cyan-500/20 mb-8 text-center">
                <Loader className="w-6 h-6 animate-spin text-cyan-400 mx-auto" />
                <p className="text-slate-400 mt-2">Loading subscription...</p>
              </div>
            ) : userSubscription ? (
              <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl p-6 border border-cyan-500/30 mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-white flex items-center gap-2 mb-2">
                      <CheckCircle className="text-green-400 w-5 h-5" /> Your Active Plan
                    </h4>
                    <p className="text-2xl font-bold text-cyan-400">{userSubscription.plan?.name || 'Premium Plan'}</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium border border-green-500/30">
                      Active
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Start Date</p>
                    <p className="text-sm font-medium text-white">{formatDateNice(userSubscription?.startDate || new Date().toISOString())}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Expires On</p>
                    <p className="text-sm font-medium text-white">{formatDateNice(computedExpiresAt)}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Days Left</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      {computedDaysLeft}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3">
                    <p className="text-xs text-slate-400 mb-1">Price Paid</p>
                    <p className="text-sm font-medium text-white">
                      {(userSubscription.plan?.price || 0).toLocaleString()} VND
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {(() => {
                  const totalDays = userSubscription.plan?.duration || 30;
                  const daysLeft = calculateDaysLeft(userSubscription.expiresAt);
                  const progress = ((totalDays - daysLeft) / totalDays) * 100;

                  return (
                    <div className="mb-4">
                      <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Usage Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-500"
                          style={{ width: `${Math.min(progress, 100)}%` }}
                        />
                      </div>
                    </div>
                  );
                })()}

                {/* Features */}
                {userSubscription.plan?.features && userSubscription.plan.features.length > 0 && (
                  <div className="border-t border-cyan-500/20 pt-4">
                    <p className="text-sm text-slate-300 mb-2 font-medium">Plan Features:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {userSubscription.plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-slate-900/40 rounded-xl p-6 border border-slate-700 mb-8">
                <div className="text-center py-4">
                  <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h4 className="text-lg font-semibold text-white mb-2">No Active Subscription</h4>
                  <p className="text-slate-400 mb-4">You don't have an active subscription plan</p>
                  <button
                    onClick={() => window.location.href = '/payment'}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-medium text-white hover:shadow-lg hover:shadow-cyan-500/40 transition"
                  >
                    Browse Plans
                  </button>
                </div>
              </div>
            )}

            {/* Available Plans Section */}
            <h4 className="text-lg font-semibold mb-4 text-white">Available Plans</h4>

            {loadingPlans ? (
              <div className="text-center py-10">
                <Loader className="animate-spin w-8 h-8 text-cyan-400 mx-auto" />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-6 rounded-2xl cursor-pointer border-2 transition relative ${selectedPlanId === p.id
                      ? "border-cyan-400 bg-slate-900/60 shadow-lg shadow-cyan-500/30"
                      : "border-slate-700 hover:border-slate-500 bg-slate-800"
                      }`}
                  >
                    {p.type === 'ENTERPRISE' && (
                      <span className="absolute top-0 right-0 bg-yellow-500/20 text-yellow-400 text-xs px-2 py-1 rounded-bl-lg font-bold border-l border-b border-yellow-500/30">VIP</span>
                    )}
                    <div className="flex justify-between items-baseline mb-4">
                      <h4 className="text-xl font-bold text-white">{p.name}</h4>
                      <span className="text-2xl font-bold text-cyan-400">
                        {p.price.toLocaleString()} VND
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mb-4">{p.duration} days access</p>

                    <div className="space-y-2 mb-6">
                      {p.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-slate-300">
                          <CheckCircle className="w-4 h-4 text-cyan-500 mt-0.5 flex-shrink-0" />
                          <span>{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {plans.length > 0 && (
              <div className="mt-8 flex justify-end">
                  <button className="px-8 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-bold text-white hover:shadow-lg hover:shadow-cyan-500/40 transition transform hover:-translate-y-0.5" onClick={() => navigate('/payment')}>
                    Upgrade to Selected Plan
                  </button>
              </div>
            )}
          </div>
        )}

        {/* --- SECURITY TAB --- */}
        {activeTab === "security" && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700 animate-in fade-in duration-300">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400">Security Settings</h3>

            {/* Change Password */}
            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700">
              <h4 className="font-semibold mb-4 text-white flex items-center gap-2">
                Change Password
              </h4>

              <div className="mb-4 bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-lg flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-200">
                  Password must contain at least 8 characters, including 1 uppercase letter, 1 number, and 1 special character.
                </p>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPwdMap.current ? "text" : "password"}
                      className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white pr-10"
                      value={securityData.currentPwd}
                      onChange={(e) => setSecurityData({ ...securityData, currentPwd: e.target.value })}
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPwd('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
                    >
                      {showPwdMap.current ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* New Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label><div className="relative">
                      <input
                        type={showPwdMap.new ? "text" : "password"}
                        className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white pr-10"
                        value={securityData.newPwd}
                        onChange={(e) => setSecurityData({ ...securityData, newPwd: e.target.value })}
                        placeholder="Min 8 chars, 1 Upper, 1 Special"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPwd('new')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
                      >
                        {showPwdMap.new ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showPwdMap.confirm ? "text" : "password"}
                        className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white pr-10"
                        value={securityData.confirmPwd}
                        onChange={(e) => setSecurityData({ ...securityData, confirmPwd: e.target.value })}
                        placeholder="Re-enter new password"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowPwd('confirm')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-400"
                      >
                        {showPwdMap.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/50 rounded-xl p-6 mb-6 border border-slate-700 opacity-75">
              <div className="flex items-start gap-4">
                <input
                  id="2fa"
                  type="checkbox"
                  checked={securityData.twoFaEnabled}
                  onChange={(e) => setSecurityData({ ...securityData, twoFaEnabled: e.target.checked })}
                  className="mt-1 w-5 h-5 accent-cyan-500"
                />
                <div className="flex-1">
                  <label htmlFor="2fa" className="font-medium text-white cursor-pointer">Two-factor authentication (2FA)</label>
                  <p className="text-sm text-slate-400 mt-1">Add an extra layer of protection (Coming soon)</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={saveSecurity} className="px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg font-medium hover:shadow-lg hover:shadow-cyan-500/50 transition-all text-white">
                Save Security Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}