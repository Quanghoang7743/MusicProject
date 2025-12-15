import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Volume2, 
  Moon, 
  Globe, 
  Download, 
  Wifi,
  Database,
  Trash2,
  Eye,
  Shield,
  Radio
} from 'lucide-react';

const DEFAULT_SETTINGS = {
  notifications: {
    pushEnabled: true,
    emailEnabled: true,
    newReleases: true,
    recommendations: false,
    socialActivity: true,
  },
  playback: {
    quality: 'high',
    autoplay: true,
    crossfade: false,
    gapless: true,
    normalizeVolume: false,
  },
  appearance: {
    theme: 'dark',
    accentColor: 'cyan',
    compactMode: false,
    showCoverArt: true,
  },
  language: {
    interface: 'en',
    contentLanguage: 'all',
  },
  downloads: {
    quality: 'high',
    onlyWifi: true,
    autoDownload: false,
    downloadLocation: 'default',
  },
  privacy: {
    listeningActivity: true,
    showProfile: true,
    shareData: false,
    explicitContent: false,
  },
  storage: {
    cacheSize: '500MB',
    clearCache: false,
  }
};

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('appSettings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [activeTab, setActiveTab] = useState('notifications');

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Could not save settings');
    }
  }, [settings]);

  const updateSetting = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const clearCache = () => {
    if (confirm('Are you sure you want to clear the cache? This will remove all downloaded content.')) {
      alert('Cache cleared successfully!');
    }
  };

  const resetSettings = () => {
    if (confirm('Reset all settings to default? This cannot be undone.')) {
      setSettings(DEFAULT_SETTINGS);
      alert('Settings reset to default.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-20 md:pt-24 pb-0 md:pb-0 px-4 md:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-2">
            Settings
          </h1>
          <p className="text-slate-400">Customize your music experience</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'notifications' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Bell className="w-4 h-4" />
            Notifications
          </button>

          <button
            onClick={() => setActiveTab('playback')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'playback' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            Playback
          </button>

          <button
            onClick={() => setActiveTab('appearance')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'appearance' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Moon className="w-4 h-4" />
            Appearance
          </button>

          <button
            onClick={() => setActiveTab('language')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'language' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Globe className="w-4 h-4" />
            Language
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'downloads' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Download className="w-4 h-4" />
            Downloads
          </button>

          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'privacy' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-4 h-4" />
            Privacy
          </button>

          <button
            onClick={() => setActiveTab('storage')}
            className={`px-6 py-3 rounded-xl font-medium transition-all whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'storage' 
                ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white shadow-lg shadow-cyan-500/50' 
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Database className="w-4 h-4" />
            Storage
          </button>
        </div>

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Bell className="w-6 h-6" />
              Notification preferences
            </h3>

            <div className="space-y-6">
              <SettingToggle
                label="Push notifications"
                description="Receive notifications on this device"
                checked={settings.notifications.pushEnabled}
                onChange={(val) => updateSetting('notifications', 'pushEnabled', val)}
              />

              <SettingToggle
                label="Email notifications"
                description="Receive updates and news via email"
                checked={settings.notifications.emailEnabled}
                onChange={(val) => updateSetting('notifications', 'emailEnabled', val)}
              />

              <SettingToggle
                label="New releases"
                description="Get notified when artists you follow release new music"
                checked={settings.notifications.newReleases}
                onChange={(val) => updateSetting('notifications', 'newReleases', val)}
              />

              <SettingToggle
                label="Recommendations"
                description="Receive personalized music recommendations"
                checked={settings.notifications.recommendations}
                onChange={(val) => updateSetting('notifications', 'recommendations', val)}
              />

              <SettingToggle
                label="Social activity"
                description="Get notified when friends share or like music"
                checked={settings.notifications.socialActivity}
                onChange={(val) => updateSetting('notifications', 'socialActivity', val)}
              />
            </div>
          </div>
        )}

        {/* Playback Tab */}
        {activeTab === 'playback' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Radio className="w-6 h-6" />
              Playback settings
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Audio quality</label>
                <select
                  value={settings.playback.quality}
                  onChange={(e) => updateSetting('playback', 'quality', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="low">Low (96 kbps)</option>
                  <option value="normal">Normal (160 kbps)</option>
                  <option value="high">High (320 kbps)</option>
                  <option value="lossless">Lossless (FLAC)</option>
                </select>
              </div>

              <SettingToggle
                label="Autoplay"
                description="Continue playing similar tracks when your music ends"
                checked={settings.playback.autoplay}
                onChange={(val) => updateSetting('playback', 'autoplay', val)}
              />

              <SettingToggle
                label="Crossfade"
                description="Fade between tracks for seamless listening"
                checked={settings.playback.crossfade}
                onChange={(val) => updateSetting('playback', 'crossfade', val)}
              />

              <SettingToggle
                label="Gapless playback"
                description="Remove silence between tracks"
                checked={settings.playback.gapless}
                onChange={(val) => updateSetting('playback', 'gapless', val)}
              />

              <SettingToggle
                label="Normalize volume"
                description="Maintain consistent volume across all tracks"
                checked={settings.playback.normalizeVolume}
                onChange={(val) => updateSetting('playback', 'normalizeVolume', val)}
              />
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Moon className="w-6 h-6" />
              Appearance
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Theme</label>
                <select
                  value={settings.appearance.theme}
                  onChange={(e) => updateSetting('appearance', 'theme', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto (system)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Accent color</label>
                <div className="grid grid-cols-6 gap-3">
                  {['cyan', 'blue', 'purple', 'pink', 'red', 'green'].map(color => (
                    <button
                      key={color}
                      onClick={() => updateSetting('appearance', 'accentColor', color)}
                      className={`h-12 rounded-lg transition-all ${
                        settings.appearance.accentColor === color 
                          ? 'ring-2 ring-white scale-110' 
                          : 'hover:scale-105'
                      }`}
                      style={{ 
                        backgroundColor: 
                          color === 'cyan' ? '#00bcd4' :
                          color === 'blue' ? '#2196f3' :
                          color === 'purple' ? '#9c27b0' :
                          color === 'pink' ? '#e91e63' :
                          color === 'red' ? '#f44336' :
                          '#4caf50'
                      }}
                    />
                  ))}
                </div>
              </div>

              <SettingToggle
                label="Compact mode"
                description="Display more content on screen"
                checked={settings.appearance.compactMode}
                onChange={(val) => updateSetting('appearance', 'compactMode', val)}
              />

              <SettingToggle
                label="Show album cover art"
                description="Display cover art in player and lists"
                checked={settings.appearance.showCoverArt}
                onChange={(val) => updateSetting('appearance', 'showCoverArt', val)}
              />
            </div>
          </div>
        )}

        {/* Language Tab */}
        {activeTab === 'language' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Globe className="w-6 h-6" />
              Language & Region
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Interface language</label>
                <select
                  value={settings.language.interface}
                  onChange={(e) => updateSetting('language', 'interface', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                  <option value="de">Deutsch</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                  <option value="zh">中文</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Content language</label>
                <select
                  value={settings.language.contentLanguage}
                  onChange={(e) => updateSetting('language', 'contentLanguage', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="all">All languages</option>
                  <option value="en">English only</option>
                  <option value="native">Native language only</option>
                </select>
                <p className="text-xs text-slate-400 mt-2">Prefer music and content in selected language</p>
              </div>
            </div>
          </div>
        )}

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Download className="w-6 h-6" />
              Download settings
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Download quality</label>
                <select
                  value={settings.downloads.quality}
                  onChange={(e) => updateSetting('downloads', 'quality', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="low">Low (save storage)</option>
                  <option value="normal">Normal</option>
                  <option value="high">High (best quality)</option>
                </select>
              </div>

              <SettingToggle
                label="Download using WiFi only"
                description="Prevent downloads on cellular data"
                checked={settings.downloads.onlyWifi}
                onChange={(val) => updateSetting('downloads', 'onlyWifi', val)}
                icon={<Wifi className="w-5 h-5 text-cyan-400" />}
              />

              <SettingToggle
                label="Auto-download"
                description="Automatically download new songs from your playlists"
                checked={settings.downloads.autoDownload}
                onChange={(val) => updateSetting('downloads', 'autoDownload', val)}
              />

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Download location</label>
                <select
                  value={settings.downloads.downloadLocation}
                  onChange={(e) => updateSetting('downloads', 'downloadLocation', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="default">Default</option>
                  <option value="sd">SD Card</option>
                  <option value="custom">Custom location</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Privacy Tab */}
        {activeTab === 'privacy' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Shield className="w-6 h-6" />
              Privacy & Security
            </h3>

            <div className="space-y-6">
              <SettingToggle
                label="Listening activity"
                description="Share what you're listening to with friends"
                checked={settings.privacy.listeningActivity}
                onChange={(val) => updateSetting('privacy', 'listeningActivity', val)}
                icon={<Eye className="w-5 h-5 text-cyan-400" />}
              />

              <SettingToggle
                label="Public profile"
                description="Allow others to see your profile and playlists"
                checked={settings.privacy.showProfile}
                onChange={(val) => updateSetting('privacy', 'showProfile', val)}
              />

              <SettingToggle
                label="Share data for improvements"
                description="Help us improve the app by sharing anonymous usage data"
                checked={settings.privacy.shareData}
                onChange={(val) => updateSetting('privacy', 'shareData', val)}
              />

              <SettingToggle
                label="Allow explicit content"
                description="Show songs with explicit lyrics"
                checked={settings.privacy.explicitContent}
                onChange={(val) => updateSetting('privacy', 'explicitContent', val)}
              />

              <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-red-400 font-medium">Privacy Notice</p>
                    <p className="text-xs text-slate-400 mt-1">
                      We take your privacy seriously. Your data is encrypted and never sold to third parties.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Storage Tab */}
        {activeTab === 'storage' && (
          <div className="bg-slate-800 rounded-2xl p-6 md:p-8 border border-slate-700">
            <h3 className="text-xl font-semibold mb-6 text-cyan-400 flex items-center gap-2">
              <Database className="w-6 h-6" />
              Storage Management
            </h3>

            <div className="space-y-6">
              {/* Storage Usage */}
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-700">
                <h4 className="font-semibold mb-4 text-white">Storage usage</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Downloaded music</span>
                    <span className="font-medium text-white">1.2 GB</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Cache</span>
                    <span className="font-medium text-white">{settings.storage.cacheSize}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">App data</span>
                    <span className="font-medium text-white">45 MB</span>
                  </div>

                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300 font-medium">Total</span>
                      <span className="font-bold text-cyan-400">1.74 GB</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cache Settings */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Maximum cache size</label>
                <select
                  value={settings.storage.cacheSize}
                  onChange={(e) => updateSetting('storage', 'cacheSize', e.target.value)}
                  className="w-full p-3 rounded-lg bg-slate-700 border border-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition text-white"
                >
                  <option value="250MB">250 MB</option>
                  <option value="500MB">500 MB</option>
                  <option value="1GB">1 GB</option>
                  <option value="2GB">2 GB</option>
                  <option value="unlimited">Unlimited</option>
                </select>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={clearCache}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500/20 text-red-400 rounded-lg font-medium hover:bg-red-500/30 border border-red-500/30 transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  Clear cache
                </button>

                <button
                  onClick={resetSettings}
                  className="w-full px-6 py-3 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-all"
                >
                  Reset all settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Reusable toggle component
function SettingToggle({ label, description, checked, onChange, icon }) {
  return (
    <div className="flex items-start gap-4 p-4 bg-slate-900/30 rounded-lg hover:bg-slate-900/50 transition">
      {icon && <div className="mt-1">{icon}</div>}
      <div className="flex-1">
        <label className="font-medium text-white cursor-pointer block">{label}</label>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">
        <button
          onClick={() => onChange(!checked)}
          className={`relative w-12 h-6 rounded-full transition-all ${
            checked ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-slate-600'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
              checked ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}