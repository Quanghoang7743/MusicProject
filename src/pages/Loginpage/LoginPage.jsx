import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react'; // Import icon cho gọn
import { useNavigate } from 'react-router-dom';
import { loginService } from '../../services/authService';

const LoginPage = ({ isOpen = true, onClose, onBack, onSuccess }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Gọi API Login
      const res = await loginService(email, password);
      console.log("✅ Login success", res);

      // 2. Lưu thông tin user
      if (res?.user) {
        localStorage.setItem("currentUser", JSON.stringify(res.user));
        // Notify other parts of the app that auth status changed (same-tab)
        try {
          window.dispatchEvent(new Event('authChanged'));
        } catch (e) {
          console.warn('Could not dispatch authChanged event', e);
        }
      }

      // 3. Xử lý sau khi login thành công
      if (typeof onSuccess === 'function') {
        onSuccess(res); // Callback nếu dùng dạng Modal
      }

      // 4. Điều hướng
      if (typeof onClose === 'function') {
        // Nếu là modal -> Đóng modal
        setTimeout(() => onClose(), 500);
      } else if (!onSuccess && !onClose) {
        // Nếu là trang riêng -> Chuyển về trang chủ (Home)
        setTimeout(() => navigate('/'), 500); 
      }

    } catch (err) {
      console.error("❌ Login failed:", err);
      // Hiển thị lỗi
      setErrorMsg("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">

        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-5 top-5 text-white bg-white/20 rounded-full p-2 z-20 hover:bg-white/30 transition"
          >
            ✕
          </button>
        )}

        {/* Left Side */}
        <div className="hidden md:flex items-center justify-center p-6 bg-gradient-to-br from-cyan-400 to-cyan-400">
          <div className="text-white text-center">
            <h1 className="text-5xl font-bold mb-4">Welcome Back!</h1>
            <p className="text-lg opacity-90">Sign in to continue listening</p>
          </div>
        </div>

        {/* Right Side (Form) */}
        <div className="p-6 md:p-12 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-cyan-400">
          <div className="w-full max-w-md bg-transparent">
            <h2 className="text-4xl font-extrabold text-white text-center mb-2">
              Login / Sign In
            </h2>
            <p className="text-center text-white/90 text-sm mb-6">
              Sign in to start listening and saving your favorite tracks.
            </p>

            {/* Error Message */}
            {errorMsg && (
              <div className="w-full text-center mb-4">
                <span className="text-red-100 bg-red-500/50 px-3 py-1.5 rounded text-sm font-medium inline-block">
                  {errorMsg}
                </span>
              </div>
            )}

            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault(); // Chặn reload trang
                if (!loading) handleLogin(); // Gọi hàm login
              }}
            >
              {/* Email Input */}
              <div>
                <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="text-slate-400"><Mail size={20}/></div>
                  <input
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if(errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter Your Email"
                    type="email"
                    required
                    disabled={loading}
                    className="w-full bg-transparent outline-none text-slate-800"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="relative flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="text-slate-400"><Lock size={20}/></div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if(errorMsg) setErrorMsg('');
                    }}
                    placeholder="Enter Password"
                    required
                    disabled={loading}
                    className="w-full bg-transparent outline-none text-slate-800 pr-10"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    type="button" // QUAN TRỌNG: type="button" để không submit form
                    disabled={loading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {/* Forgot password link */}
                <div className="w-full text-right mt-2">
                  <button
                    type="button"
                    onClick={() => navigate('/forgot-password')}
                    disabled={loading}
                    className="text-sm text-white/90 underline hover:text-white"
                  >
                    Forgot password?
                  </button>
                </div>
              </div>

              {/* Keep signed in */}
              <div className="flex items-center gap-2 text-white text-sm">
                <input
                  type="checkbox"
                  checked={keepSignedIn}
                  onChange={() => setKeepSignedIn(!keepSignedIn)}
                  disabled={loading}
                  className="accent-cyan-400 w-4 h-4"
                />
                <label>Keep Me Signed In</label>
              </div>

              {/* === NÚT LOGIN (SUBMIT) === */}
              <div className="flex items-center justify-center">
                <button
                  type="submit" // QUAN TRỌNG: Đây là nút submit form
                  disabled={loading}
                  className="px-8 py-3 border border-white/60 rounded-full text-white font-medium hover:bg-white/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {loading ? "Logging in..." : "Login Now"}
                </button>
              </div>

              {/* === NÚT CHUYỂN SANG REGISTER === */}
              <p className="text-center text-white/90 text-sm mt-3">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    // Logic chuyển trang nằm ở đây
                    if (onBack) {
                      onBack();
                    } else {
                      navigate('/register');
                    }
                  }}
                  type="button" // QUAN TRỌNG: type="button" để KHÔNG submit form
                  disabled={loading}
                  className="underline font-semibold hover:text-white disabled:opacity-40"
                >
                  Register Here
                </button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;