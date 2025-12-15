import { useState } from 'react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Globe,
    Database,
    Mail,
    Lock,
    Eye,
    EyeOff,
    Save,
    RefreshCw,
    Download,
    Upload,
    Trash2,
    Check,
    X,
    Sun,
    Moon,
    Monitor,
    Volume2,
    Music,
    Image,
    FileText,
    Cloud,
    Key,
    Smartphone,
    CreditCard,
    Zap
} from 'lucide-react';

const AdminSettingsPage = () => {
    const [activeTab, setActiveTab] = useState('general');
    const [showPassword, setShowPassword] = useState(false);
    const [showApiKey, setShowApiKey] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [frogClicks, setFrogClicks] = useState(0);
    const [secretUnlocked, setSecretUnlocked] = useState(false);
    const [rainbowMode, setRainbowMode] = useState(false);

    // General Settings
    const [generalSettings, setGeneralSettings] = useState({
        siteName: 'MusicStream Admin',
        siteDescription: 'Professional music streaming platform',
        contactEmail: 'admin@musicstream.com',
        supportEmail: 'support@musicstream.com',
        maintenanceMode: false,
        allowRegistration: true,
        requireEmailVerification: true
    });

    // Profile Settings
    const [profileSettings, setProfileSettings] = useState({
        name: 'John Administrator',
        email: 'john@musicstream.com',
        phone: '+1 234-567-8900',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        twoFactorEnabled: true
    });

    // Notification Settings
    const [notificationSettings, setNotificationSettings] = useState({
        emailNotifications: true,
        pushNotifications: true,
        newUserRegistration: true,
        newSongUpload: true,
        reportedContent: true,
        systemAlerts: true,
        weeklyReport: true,
        monthlyReport: false,
        soundEnabled: true
    });

    // Appearance Settings
    const [appearanceSettings, setAppearanceSettings] = useState({
        theme: 'light',
        accentColor: '#a855f7',
        compactMode: false,
        showAnimations: true,
        fontSize: 'medium'
    });

    // Security Settings
    const [securitySettings, setSecuritySettings] = useState({
        sessionTimeout: '30',
        maxLoginAttempts: '5',
        passwordExpiry: '90',
        requireStrongPassword: true,
        allowMultipleSessions: false,
        ipWhitelist: '',
        logSecurityEvents: true
    });

    // API Settings
    const [apiSettings, setApiSettings] = useState({
        apiKey: process.env.VITE_API_KEY,
        webhookUrl: process.env.VITE_WEB_HOCK,
        rateLimit: '1000',
        enableCors: true,
        apiVersion: 'v2.0'
    });

    // Storage Settings
    const [storageSettings, setStorageSettings] = useState({
        maxFileSize: '50',
        allowedFormats: 'MP3, WAV, FLAC, AAC',
        storageProvider: 'aws',
        cdnEnabled: true,
        autoBackup: true,
        backupFrequency: 'daily',
        compressionEnabled: true
    });

    // Payment Settings
    const [paymentSettings, setPaymentSettings] = useState({
        stripePublicKey: 'pk_test_xxxxxxxxxx',
        stripeSecretKey: 'sk_test_xxxxxxxxxx',
        paypalClientId: 'AxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxBCD',
        currency: 'USD',
        taxRate: '10',
        subscriptionEnabled: true
    });

    const handleSave = () => {
        // Simulate save
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'api', label: 'API', icon: Key },
        { id: 'storage', label: 'Storage', icon: Database },
        { id: 'payment', label: 'Payment', icon: CreditCard },
        ...(secretUnlocked ? [{ id: 'secret', label: '🐸', icon: Zap }] : [])
    ];

    const handleFrogClick = () => {
        const newCount = frogClicks + 1;
        setFrogClicks(newCount);
        if (newCount >= 7 && !secretUnlocked) {
            setSecretUnlocked(true);
            setActiveTab('secret');
        }
    };

    const activateRainbowMode = () => {
        setRainbowMode(true);
        setTimeout(() => setRainbowMode(false), 500000);
    };

    const themeOptions = [
        { value: 'light', label: 'Light', icon: Sun },
        { value: 'dark', label: 'Dark', icon: Moon },
        { value: 'auto', label: 'Auto', icon: Monitor }
    ];

    const colorOptions = [
        { value: '#a855f7', label: 'Purple' },
        { value: '#ec4899', label: 'Pink' },
        { value: '#3b82f6', label: 'Blue' },
        { value: '#10b981', label: 'Green' },
        { value: '#f59e0b', label: 'Orange' },
        { value: '#ef4444', label: 'Red' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 relative overflow-x-hidden">
            {/* Rainbow Flash Overlay */}
            {rainbowMode && (
                <div
                    className="fixed inset-0 z-50 pointer-events-none"
                    style={{
                        animation: 'rainbow-flash 0.1s infinite'
                    }}
                >
                    <style>{`
          @keyframes rainbow-flash {
            0% { background: rgba(255, 0, 0, 0.3); }
            14% { background: rgba(255, 127, 0, 0.3); }
            28% { background: rgba(255, 255, 0, 0.3); }
            42% { background: rgba(0, 255, 0, 0.3); }
            57% { background: rgba(0, 0, 255, 0.3); }
            71% { background: rgba(75, 0, 130, 0.3); }
            85% { background: rgba(148, 0, 211, 0.3); }
            100% { background: rgba(255, 0, 0, 0.3); }
          }
        `}</style>
                </div>
            )}
            <div className="p-4 md:p-6 lg:p-6">
                <div className="max-w-full mx-auto lg:px-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center gap-3 mb-2">
                            <Settings className="w-8 h-8 text-purple-600" />
                            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                        </div>
                        <p className="text-gray-600">Manage your platform configuration and preferences</p>
                    </div>

                    {/* Success Message */}
                    {saveSuccess && (
                        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                            <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                            <span className="text-green-800 font-medium">Settings saved successfully!</span>
                        </div>
                    )}

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Sidebar Tabs */}
                        <div className="lg:w-64 flex-shrink-0">
                            <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm sticky top-6">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === tab.id
                                            ? 'bg-purple-50 text-purple-600'
                                            : 'text-gray-700 hover:bg-gray-50'
                                            }`}
                                    >
                                        <tab.icon className="w-5 h-5" />
                                        {tab.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1">
                            <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
                                {/* General Settings */}
                                {activeTab === 'general' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">General Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Configure basic platform settings</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                                            <input
                                                type="text"
                                                value={generalSettings.siteName}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Site Description</label>
                                            <textarea
                                                value={generalSettings.siteDescription}
                                                onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                                                rows={3}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                                <input
                                                    type="email"
                                                    value={generalSettings.contactEmail}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, contactEmail: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                                                <input
                                                    type="email"
                                                    value={generalSettings.supportEmail}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={generalSettings.maintenanceMode}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, maintenanceMode: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Maintenance Mode</span>
                                                    <p className="text-sm text-gray-600">Temporarily disable public access</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={generalSettings.allowRegistration}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, allowRegistration: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Allow User Registration</span>
                                                    <p className="text-sm text-gray-600">Enable new users to sign up</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={generalSettings.requireEmailVerification}
                                                    onChange={(e) => setGeneralSettings({ ...generalSettings, requireEmailVerification: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Require Email Verification</span>
                                                    <p className="text-sm text-gray-600">Users must verify email before accessing</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Profile Settings */}
                                {activeTab === 'profile' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Profile Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Manage your personal information</p>
                                        </div>

                                        <div className="flex items-center gap-4 pb-6 border-b border-gray-200">
                                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white text-2xl font-bold">
                                                JA
                                            </div>
                                            <div className="flex-1">
                                                <button className="bg-purple-50 text-purple-600 hover:bg-purple-100 px-4 py-2 rounded-lg font-medium transition mr-2">
                                                    Change Avatar
                                                </button>
                                                <button className="bg-red-50 text-red-600 hover:bg-red-100 px-4 py-2 rounded-lg font-medium transition">
                                                    Remove
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                                <input
                                                    type="text"
                                                    value={profileSettings.name}
                                                    onChange={(e) => setProfileSettings({ ...profileSettings, name: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                                <input
                                                    type="email"
                                                    value={profileSettings.email}
                                                    onChange={(e) => setProfileSettings({ ...profileSettings, email: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                            <input
                                                type="tel"
                                                value={profileSettings.phone}
                                                onChange={(e) => setProfileSettings({ ...profileSettings, phone: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                                                    <div className="relative">
                                                        <input
                                                            type={showPassword ? "text" : "password"}
                                                            value={profileSettings.currentPassword}
                                                            onChange={(e) => setProfileSettings({ ...profileSettings, currentPassword: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 pr-10 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                                                        <input
                                                            type="password"
                                                            value={profileSettings.newPassword}
                                                            onChange={(e) => setProfileSettings({ ...profileSettings, newPassword: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                                                        <input
                                                            type="password"
                                                            value={profileSettings.confirmPassword}
                                                            onChange={(e) => setProfileSettings({ ...profileSettings, confirmPassword: e.target.value })}
                                                            className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={profileSettings.twoFactorEnabled}
                                                    onChange={(e) => setProfileSettings({ ...profileSettings, twoFactorEnabled: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Two-Factor Authentication</span>
                                                    <p className="text-sm text-gray-600">Add an extra layer of security</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Notifications Settings */}
                                {activeTab === 'notifications' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Notification Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Control how you receive notifications</p>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Delivery Methods</h3>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.emailNotifications}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Email Notifications</span>
                                                    <p className="text-sm text-gray-600">Receive updates via email</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.pushNotifications}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, pushNotifications: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Push Notifications</span>
                                                    <p className="text-sm text-gray-600">Get instant browser notifications</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.soundEnabled}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, soundEnabled: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Notification Sounds</span>
                                                    <p className="text-sm text-gray-600">Play sound for notifications</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Activity Notifications</h3>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.newUserRegistration}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, newUserRegistration: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <span className="text-gray-900">New User Registration</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.newSongUpload}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, newSongUpload: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <span className="text-gray-900">New Song Upload</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.reportedContent}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, reportedContent: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <span className="text-gray-900">Reported Content</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.systemAlerts}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, systemAlerts: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <span className="text-gray-900">System Alerts</span>
                                            </label>
                                        </div>

                                        <div className="space-y-4 pt-4 border-t border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Reports</h3>
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.weeklyReport}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <span className="text-gray-900">Weekly Activity Report</span>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={notificationSettings.monthlyReport}
                                                    onChange={(e) => setNotificationSettings({ ...notificationSettings, monthlyReport: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <span className="text-gray-900">Monthly Summary Report</span>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Security Settings */}
                                {activeTab === 'security' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Configure security and access control</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Session Timeout (minutes)</label>
                                                <input
                                                    type="number"
                                                    value={securitySettings.sessionTimeout}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Max Login Attempts</label>
                                                <input
                                                    type="number"
                                                    value={securitySettings.maxLoginAttempts}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Password Expiry (days)</label>
                                            <input
                                                type="number"
                                                value={securitySettings.passwordExpiry}
                                                onChange={(e) => setSecuritySettings({ ...securitySettings, passwordExpiry: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">IP Whitelist (comma-separated)</label>
                                            <textarea
                                                value={securitySettings.ipWhitelist}
                                                onChange={(e) => setSecuritySettings({ ...securitySettings, ipWhitelist: e.target.value })}
                                                rows={3}
                                                placeholder="192.168.1.1, 10.0.0.1"
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.requireStrongPassword}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, requireStrongPassword: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Require Strong Passwords</span>
                                                    <p className="text-sm text-gray-600">Enforce complex password requirements</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.allowMultipleSessions}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, allowMultipleSessions: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Allow Multiple Sessions</span>
                                                    <p className="text-sm text-gray-600">Users can login from multiple devices</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={securitySettings.logSecurityEvents}
                                                    onChange={(e) => setSecuritySettings({ ...securitySettings, logSecurityEvents: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Log Security Events</span>
                                                    <p className="text-sm text-gray-600">Track login attempts and security events</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Appearance Settings */}
                                {activeTab === 'appearance' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Appearance Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Customize the look and feel</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Theme</label>
                                            <div className="grid grid-cols-3 gap-3">
                                                {themeOptions.map((theme) => (
                                                    <button
                                                        key={theme.value}
                                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, theme: theme.value })}
                                                        className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition ${appearanceSettings.theme === theme.value
                                                            ? 'border-purple-600 bg-purple-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <theme.icon className={`w-6 h-6 ${appearanceSettings.theme === theme.value ? 'text-purple-600' : 'text-gray-600'}`} />
                                                        <span className={`text-sm font-medium ${appearanceSettings.theme === theme.value ? 'text-purple-600' : 'text-gray-700'}`}>
                                                            {theme.label}
                                                        </span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Accent Color</label>
                                            <div className="grid grid-cols-6 gap-3">
                                                {colorOptions.map((color) => (
                                                    <button
                                                        key={color.value}
                                                        onClick={() => setAppearanceSettings({ ...appearanceSettings, accentColor: color.value })}
                                                        className={`w-12 h-12 rounded-lg border-4 transition ${appearanceSettings.accentColor === color.value
                                                            ? 'border-gray-900 scale-110'
                                                            : 'border-gray-200 hover:scale-105'
                                                            }`}
                                                        style={{ backgroundColor: color.value }}
                                                        title={color.label}
                                                    />
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Font Size</label>
                                            <select
                                                value={appearanceSettings.fontSize}
                                                onChange={(e) => setAppearanceSettings({ ...appearanceSettings, fontSize: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="small">Small</option>
                                                <option value="medium">Medium</option>
                                                <option value="large">Large</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={appearanceSettings.compactMode}
                                                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Compact Mode</span>
                                                    <p className="text-sm text-gray-600">Reduce spacing and padding</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={appearanceSettings.showAnimations}
                                                    onChange={(e) => setAppearanceSettings({ ...appearanceSettings, showAnimations: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Show Animations</span>
                                                    <p className="text-sm text-gray-600">Enable smooth transitions and effects</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* API Settings */}
                                {activeTab === 'api' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">API Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Configure API access and integrations</p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                                            <div className="relative">
                                                <input
                                                    type={showApiKey ? "text" : "password"}
                                                    value={apiSettings.apiKey}
                                                    onChange={(e) => setApiSettings({ ...apiSettings, apiKey: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 pr-24 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-mono text-sm"
                                                />
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowApiKey(!showApiKey)}
                                                        className="p-2 hover:bg-gray-100 rounded transition"
                                                    >
                                                        {showApiKey ? <EyeOff className="w-4 h-4 text-gray-600" /> : <Eye className="w-4 h-4 text-gray-600" />}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="p-2 hover:bg-gray-100 rounded transition"
                                                    >
                                                        <RefreshCw className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                                            <input
                                                type="url"
                                                value={apiSettings.webhookUrl}
                                                onChange={(e) => setApiSettings({ ...apiSettings, webhookUrl: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Rate Limit (requests/hour)</label>
                                                <input
                                                    type="number"
                                                    value={apiSettings.rateLimit}
                                                    onChange={(e) => setApiSettings({ ...apiSettings, rateLimit: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">API Version</label>
                                                <select
                                                    value={apiSettings.apiVersion}
                                                    onChange={(e) => setApiSettings({ ...apiSettings, apiVersion: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                >
                                                    <option value="v1.0">v1.0</option>
                                                    <option value="v2.0">v2.0</option>
                                                    <option value="v3.0">v3.0 (Beta)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={apiSettings.enableCors}
                                                    onChange={(e) => setApiSettings({ ...apiSettings, enableCors: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Enable CORS</span>
                                                    <p className="text-sm text-gray-600">Allow cross-origin requests</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                            <div className="flex gap-3">
                                                <Key className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-blue-900 font-medium mb-1">API Documentation</h4>
                                                    <p className="text-blue-700 text-sm">
                                                        Visit our developer portal to learn more about API endpoints and integration.
                                                    </p>
                                                    <a href="#" className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-2 inline-block">
                                                        View Documentation →
                                                    </a>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Hidden Frog Button - Bottom Right */}
                                        <button
                                            onClick={handleFrogClick}
                                            className="fixed bottom-6 right-6 w-12 h-12 bg-green-100 hover:bg-green-200 rounded-full flex items-center justify-center text-2xl shadow-lg hover:shadow-xl transition-all hover:scale-110 opacity-30 hover:opacity-100"
                                            title={`${frogClicks}/7 clicks`}
                                        >
                                            🐸
                                        </button>
                                    </div>
                                )}

                                {/* Storage Settings */}
                                {activeTab === 'storage' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Storage Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Manage file storage and backup options</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Max File Size (MB)</label>
                                                <input
                                                    type="number"
                                                    value={storageSettings.maxFileSize}
                                                    onChange={(e) => setStorageSettings({ ...storageSettings, maxFileSize: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Storage Provider</label>
                                                <select
                                                    value={storageSettings.storageProvider}
                                                    onChange={(e) => setStorageSettings({ ...storageSettings, storageProvider: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                >
                                                    <option value="aws">Amazon S3</option>
                                                    <option value="gcp">Google Cloud Storage</option>
                                                    <option value="azure">Azure Storage</option>
                                                    <option value="local">Local Storage</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Formats</label>
                                            <input
                                                type="text"
                                                value={storageSettings.allowedFormats}
                                                onChange={(e) => setStorageSettings({ ...storageSettings, allowedFormats: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                placeholder="MP3, WAV, FLAC"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Backup Frequency</label>
                                            <select
                                                value={storageSettings.backupFrequency}
                                                onChange={(e) => setStorageSettings({ ...storageSettings, backupFrequency: e.target.value })}
                                                className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                            >
                                                <option value="hourly">Hourly</option>
                                                <option value="daily">Daily</option>
                                                <option value="weekly">Weekly</option>
                                                <option value="monthly">Monthly</option>
                                            </select>
                                        </div>

                                        <div className="space-y-3 pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={storageSettings.cdnEnabled}
                                                    onChange={(e) => setStorageSettings({ ...storageSettings, cdnEnabled: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Enable CDN</span>
                                                    <p className="text-sm text-gray-600">Deliver content faster with CDN</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={storageSettings.autoBackup}
                                                    onChange={(e) => setStorageSettings({ ...storageSettings, autoBackup: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Automatic Backup</span>
                                                    <p className="text-sm text-gray-600">Regularly backup your data</p>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={storageSettings.compressionEnabled}
                                                    onChange={(e) => setStorageSettings({ ...storageSettings, compressionEnabled: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">File Compression</span>
                                                    <p className="text-sm text-gray-600">Compress files to save storage space</p>
                                                </div>
                                            </label>
                                        </div>

                                        <div className="flex gap-3 pt-4 border-t border-gray-200">
                                            <button className="flex-1 bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2">
                                                <Download className="w-5 h-5" />
                                                Download Backup
                                            </button>
                                            <button className="flex-1 bg-green-50 text-green-600 hover:bg-green-100 px-4 py-3 rounded-lg font-medium transition flex items-center justify-center gap-2">
                                                <Upload className="w-5 h-5" />
                                                Upload Backup
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Payment Settings */}
                                {activeTab === 'payment' && (
                                    <div className="p-6 space-y-6">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-4">Payment Settings</h2>
                                            <p className="text-gray-600 text-sm mb-6">Configure payment gateways and billing</p>
                                        </div>

                                        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4 mb-6">
                                            <div className="flex gap-3">
                                                <CreditCard className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="text-purple-900 font-medium mb-1">Secure Payment Processing</h4>
                                                    <p className="text-purple-700 text-sm">
                                                        All payment information is encrypted and securely stored.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">Stripe Configuration</h3>
                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Publishable Key</label>
                                                    <input
                                                        type="text"
                                                        value={paymentSettings.stripePublicKey}
                                                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripePublicKey: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-mono text-sm"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">Secret Key</label>
                                                    <input
                                                        type="password"
                                                        value={paymentSettings.stripeSecretKey}
                                                        onChange={(e) => setPaymentSettings({ ...paymentSettings, stripeSecretKey: e.target.value })}
                                                        className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-mono text-sm"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <h3 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">PayPal Configuration</h3>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Client ID</label>
                                                <input
                                                    type="text"
                                                    value={paymentSettings.paypalClientId}
                                                    onChange={(e) => setPaymentSettings({ ...paymentSettings, paypalClientId: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 font-mono text-sm"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                                                <select
                                                    value={paymentSettings.currency}
                                                    onChange={(e) => setPaymentSettings({ ...paymentSettings, currency: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                >
                                                    <option value="USD">USD - US Dollar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                    <option value="GBP">GBP - British Pound</option>
                                                    <option value="JPY">JPY - Japanese Yen</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                                                <input
                                                    type="number"
                                                    value={paymentSettings.taxRate}
                                                    onChange={(e) => setPaymentSettings({ ...paymentSettings, taxRate: e.target.value })}
                                                    className="w-full bg-gray-50 border border-gray-300 text-gray-900 rounded-lg px-4 py-2.5 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t border-gray-200">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={paymentSettings.subscriptionEnabled}
                                                    onChange={(e) => setPaymentSettings({ ...paymentSettings, subscriptionEnabled: e.target.checked })}
                                                    className="w-5 h-5 text-purple-600 rounded focus:ring-2 focus:ring-purple-200"
                                                />
                                                <div>
                                                    <span className="text-gray-900 font-medium">Enable Subscriptions</span>
                                                    <p className="text-sm text-gray-600">Allow users to subscribe to premium plans</p>
                                                </div>
                                            </label>
                                        </div>
                                    </div>
                                )}

                                {/* Secret Settings */}
                                {activeTab === 'secret' && (
                                    <div className="p-6 space-y-6">

                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-purple-50 via-pink-50 to-yellow-50 border-2 border-purple-300 rounded-lg p-6 text-center">
                                                <button
                                                    onClick={activateRainbowMode}
                                                    className="bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500 text-white hover:from-purple-500 hover:via-blue-500 hover:via-green-500 hover:via-yellow-500 hover:to-red-500 px-8 py-4 rounded-lg font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
                                                >
                                                    frog
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Save Button */}
                                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                                    <button className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition font-medium">
                                        Reset
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 transition font-medium shadow-lg shadow-purple-500/30 flex items-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettingsPage;