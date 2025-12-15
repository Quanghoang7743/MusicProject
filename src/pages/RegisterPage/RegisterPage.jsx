import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { registerService } from '../../services/authService'; 
import userService from '../../services/userService';

const RegisterPage = ({ isOpen = true, onClose, onBack, onRegistered }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  // Country code fixed to +84 per request
  const [countryCode] = useState('+84');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Allowed email domains (same list as admin page)
  const allowedEmailDomains = [
    'gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'live.com', 'icloud.com', 'aol.com', 'msn.com', 'protonmail.com', 'yandex.com', 'mail.com'
  ];

  // Hàm helper để reset lỗi khi user nhập liệu
  const handleInputChange = (setter) => (e) => {
    setter(e.target.value);
    if (errorMsg) setErrorMsg('');
  };

  const clearFieldError = (field) => {
    setFieldErrors(prev => ({ ...prev, [field]: null }));
  };

  const validatePassword = (pwd) => {
    // Regex: Tối thiểu 8 ký tự, 1 chữ hoa, 1 số, 1 ký tự đặc biệt
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    return regex.test(pwd);
  };

  const handleRegister = async () => {
    // 1. Reset lỗi cũ
    setErrorMsg('');
    setFieldErrors({});

    // 2. Validate fields
    const v = {};

    if (!fullName) v.fullName = 'Full name is required.';
    if (!email) v.email = "Email is required.";
    if (!phoneNumber) v.phoneNumber = 'Phone number is required.';
    if (!password) v.password = 'Password is required.';
    if (!confirmPassword) v.confirmPassword = 'Please confirm your password.';

    // email must contain @ and be an allowed domain
    if (email) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        v.email = 'Please include an "@" and a valid email address.';
      } else {
        const domain = email.split('@').pop().toLowerCase();
        if (!allowedEmailDomains.includes(domain)) {
          v.email = `Email domain not allowed. Use one of: ${allowedEmailDomains.join(', ')}`;
        }
      }
    }

    // phone validation: when using +84 prefix we accept either
    // - 10 digits starting with 0 (e.g. 0912345678) OR
    // - 9 digits (e.g. 912345678) — user will type local part after +84
    let trimmedPhone = '';
    if (phoneNumber) {
      trimmedPhone = phoneNumber.toString().trim();
      if (countryCode === '+84') {
        const isWithZero = /^0\d{9}$/.test(trimmedPhone);
        const isNine = /^\d{9}$/.test(trimmedPhone);
        const isIntl = /^\+84\d{9}$/.test(trimmedPhone);
        if (!(isWithZero || isNine || isIntl)) {
          v.phoneNumber = 'Phone invalid: enter 10 digits starting with 0 (e.g. 0912345678) or 9 digits when using +84 (e.g. 912345678).';
        }
      } else {
        const phoneOk = /^0\d{9}$/.test(trimmedPhone);
        if (!phoneOk) v.phoneNumber = 'Phone number invalid: must be exactly 10 digits and start with 0 (e.g. 0912345678).';
      }
    }

    // password strength
    if (password && !validatePassword(password)) v.password = 'Password must contain 8+ chars, uppercase, number & special char.';

    // confirm
    if (password && confirmPassword && password !== confirmPassword) v.confirmPassword = 'Passwords do not match.';

    if (Object.keys(v).length > 0) {
      setFieldErrors(v);
      setErrorMsg(Object.values(v)[0]);
      return;
    }
    // Check server for existing email (best-effort)
    try {
      const resp = await userService.getAll({ email });
      const list = resp?.items || resp?.data || resp || [];
      if (Array.isArray(list) && list.length > 0) {
        const exists = list.some(u => (u.email || '').toString().toLowerCase() === (email || '').toLowerCase());
        if (exists) {
          setFieldErrors(prev => ({ ...prev, email: 'Email already exists. Please use a different email.' }));
          setErrorMsg('Email already exists.');
          return;
        }
      }
    } catch (err) {
      // ignore errors here (server might not support filtering); server-side will still reject duplicates
      console.warn('Could not verify email uniqueness:', err);
    }
    
    setLoading(true);

    try {
        // 4. Gọi API (send phone in the local 10-digit format expected by the server)
        let phoneToSend = trimmedPhone || phoneNumber;
        if (countryCode === '+84' && phoneToSend) {
          // Normalize to local 10-digit format because backend expects local numbers
          if (/^\+84\d{9}$/.test(phoneToSend)) {
            // +849123... -> 09123...
            phoneToSend = `0${phoneToSend.slice(3)}`;
          } else if (/^0\d{9}$/.test(phoneToSend)) {
            // already local 0xxxxxxxxx
            // keep as-is
          } else if (/^\d{9}$/.test(phoneToSend)) {
            // 9-digit local part -> prepend 0 to make local format
            phoneToSend = `0${phoneToSend}`;
          }
        }
        await registerService(fullName, email, password, phoneToSend);
        
        alert('Registration successful! Please login.'); 
        onRegistered && onRegistered(); 

    } catch (err) {
        console.error('Register failed:', err);
        
        const data = err.response?.data;
        const message = data?.message;

        if (Array.isArray(message)) {
            setErrorMsg(message[0]); 
        } else if (message === 'sv_err_user_already_existed') {
            setErrorMsg('Email or phone number already exists.');
        } else {
            setErrorMsg(message || data?.error || "Registration failed. Please try again.");
        }

    } finally {
        setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <button onClick={onClose} className="absolute right-5 top-5 text-white bg-white/20 rounded-full p-2 z-20 hover:bg-white/40 transition">✕</button>

        {/* Left illustration */}
        <div className="hidden md:flex items-center justify-center p-6 bg-gradient-to-br from-cyan-400 to-cyan-400">
           <div className="text-white text-center">
             <h2 className="text-4xl font-extrabold mb-2">Welcome !</h2>
             <p className="text-white/90">Sign up to continue listening</p>
           </div>
        </div>

        {/* Right form panel */}
        <div className="p-6 md:p-12 flex items-center justify-center bg-gradient-to-br from-cyan-400 to-cyan-400">
          <div className="w-full max-w-md bg-transparent">
            <h2 className="text-4xl font-extrabold text-white text-center mb-6">Register / Sign Up</h2>
            
            {/* Hiển thị lỗi */}
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
                    e.preventDefault(); 
                    if (!loading) handleRegister(); 
                }}
            >
              {/* Fullname */}
              <div>
                <label className="sr-only">Full name</label>
                <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="text-slate-400">👤</div>
                  <input
                    value={fullName}
                    onChange={(e) => { handleInputChange(setFullName)(e); clearFieldError('fullName'); }}
                    placeholder="Enter Your Name"
                    className="w-full bg-transparent outline-none text-slate-800"
                  />
                </div>
                
              </div>

              {/* Email */}
              <div>
                <label className="sr-only">Email</label>
                <div className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="text-slate-400">✉️</div>
                  <input
                    value={email}
                    onChange={(e) => { handleInputChange(setEmail)(e); clearFieldError('email'); }}
                    placeholder="Enter Your Email"
                    type="email"
                    className="w-full bg-transparent outline-none text-slate-800"
                  />
                </div>
                
              </div>

              {/* Phone Number */}
              <div>
                <label className="sr-only">Phone number</label>
                <div className="flex items-center gap-3 bg-white rounded-2xl px-3 py-2 shadow-sm">
                  <div className="text-slate-400 pl-1">📞</div>
                  <span className="text-slate-800 mr-3 font-medium">+84</span>
                  <input
                    value={phoneNumber}
                    onChange={(e) => { handleInputChange(setPhoneNumber)(e); clearFieldError('phoneNumber'); }}
                    placeholder="Enter Phone Number"
                    type="tel"
                    className="flex-1 bg-transparent outline-none text-slate-800"
                  />
                </div>
                
              </div>

              {/* Password */}
              <div>
                <label className="sr-only">Password</label>
                <div className="relative flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="text-slate-400">🔒</div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => { handleInputChange(setPassword)(e); clearFieldError('password'); }}
                    placeholder="Enter Password"
                    className="w-full bg-transparent outline-none text-slate-800 pr-10"
                  />
                  <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-white/90 mt-1 ml-2 font-medium">
                  * Requires: 8 chars, uppercase, number & special char.
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="sr-only">Confirm password</label>
                <div className="relative flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm">
                  <div className="text-slate-400">🔁</div>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => { handleInputChange(setConfirmPassword)(e); clearFieldError('confirmPassword'); }}
                    placeholder="Confirm Password"
                    className="w-full bg-transparent outline-none text-slate-800 pr-10"
                  />
                  <button onClick={() => setShowConfirm(!showConfirm)} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700">
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
              </div>

              <div className="flex items-center justify-center pt-2">
                <button 
                    type="submit" 
                    disabled={loading} 
                    className="px-8 py-3 border border-white/60 rounded-full text-white font-medium hover:bg-white/10 transition disabled:opacity-40"
                >
                    {loading ? "Registering..." : "Register Now"}
                </button>
              </div>

              <p className="text-center text-white/90 text-sm mt-3">
                Already Have An Account?{' '}
                <button onClick={onBack} type="button" className="underline font-bold hover:text-white">Login Here</button>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;