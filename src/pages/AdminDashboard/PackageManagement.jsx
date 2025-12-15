import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Edit, Trash2, Save, X, Search, 
  DollarSign, Users, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import packageService from '../../services/packageService';

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  // Đã xóa state filterStatus
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await packageService.getAll();
      
      let transformedPackages = [];
      if (Array.isArray(data)) transformedPackages = data;
      else if (data?.items && Array.isArray(data.items)) transformedPackages = data.items;
      else if (data?.data && Array.isArray(data.data)) transformedPackages = data.data;

      transformedPackages = transformedPackages.map(pkg => ({
        id: pkg.id || pkg.planId || `pkg-${Date.now()}`,
        name: pkg.name || 'Unnamed Plan',
        description: pkg.description || '',
        type: pkg.type || 'PRO',
        resetInterval: pkg.resetInterval || 'MONTHLY',
        price: parseFloat(pkg.price) || 0,
        originalPrice: parseFloat(pkg.price) || 0, 
        duration: pkg.duration || 30,
        status: pkg.status || 'active',
        features: Array.isArray(pkg.features) && pkg.features.length > 0
          ? pkg.features
          : (pkg.description || '')
              .split('\n')
              .map(line => line.replace(/^[\s*-]*\s*/, '').trim())
              .filter(line => line.length > 0),
        currentUsers: pkg.currentUsers || 0,
        discount: 0
      }));

      setPackages(transformedPackages);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to load packages: ${err.response?.data?.message || err.message}`);
      setPackages([]);
    } finally {
      setLoading(false);
    }
  };

  const PackageForm = ({ pkg, onSave, onClose }) => {
    const [formData, setFormData] = useState(pkg ? {
      ...pkg,
      featuresMarkdown: (pkg.features || []).join('\n')
    } : {
      name: '',
      description: '', 
      type: 'PRO',
      resetInterval: 'MONTHLY',
      price: 0,
      duration: 30,
      status: 'active',
      featuresMarkdown: '',
      currentUsers: 0,
      discount: 0
    });
    const [saving, setSaving] = useState(false);

    const renderMarkdownPreview = (markdown) => {
      if (!markdown) return '';
      return markdown.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('');
    };

    const handleSubmit = async () => {
      if (!formData.name || formData.price < 0) {
        alert('Please fill in Package Name and valid Price');
        return;
      }

      setSaving(true);
      try {
        const featuresArray = formData.featuresMarkdown
          .split('\n')
          .map(line => line.replace(/^[\s*-]*\s*/, '').trim())
          .filter(line => line.length > 0);

        const packageData = {
          ...formData,
          description: formData.featuresMarkdown, 
          originalPrice: formData.price,
          discount: 0,
          features: featuresArray 
        };

        await onSave(packageData);
        onClose();
      } catch (err) {
        alert(`Failed to save: ${err.response?.data?.message || err.message}`);
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 border border-gray-200 max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between mb-6 border-b pb-4">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="w-6 h-6 text-purple-600" />
              {pkg ? 'Edit Package' : 'Create New Package'}
            </h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Package Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
                  placeholder="e.g. Premium Plan"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type (Tier) *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-gray-50 text-gray-900 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                >
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Features (Markdown List)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <textarea
                  value={formData.featuresMarkdown}
                  onChange={(e) => setFormData({ ...formData, featuresMarkdown: e.target.value })}
                  className="w-full bg-white text-gray-900 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 h-32 font-mono text-sm"
                  placeholder="- Feature 1&#10;- Feature 2"
                />
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 h-32 overflow-y-auto">
                  <p className="text-xs text-gray-400 uppercase font-bold mb-2">Preview</p>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1" 
                      dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(formData.featuresMarkdown) }} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-gray-50 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500"
                />
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Reset</label>
                <select
                  value={formData.resetInterval}
                  onChange={(e) => setFormData({ ...formData, resetInterval: e.target.value })}
                  className="w-full bg-gray-50 px-2 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500 text-sm"
                >
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                </select>
              </div>
              <div className="col-span-1">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (d)</label>
                <input
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  className="w-full bg-gray-50 px-4 py-2.5 border border-gray-300 rounded-lg focus:border-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-100">
              <button
                onClick={onClose}
                disabled={saving}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg hover:shadow-purple-500/30 transition font-medium flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {pkg ? 'Save Changes' : 'Create Package'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const handleSavePackage = async (packageData) => {
    try {
      if (editingPackage) {
        await packageService.update(packageData.id, packageData);
      } else {
        await packageService.create(packageData);
      }
      await fetchPackages();
      setShowPackageModal(false);
      setEditingPackage(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeletePackage = async (id) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setLoading(true);
      try {
        await packageService.delete(id);
        await fetchPackages();
      } catch (err) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  // Logic filter đơn giản hóa, bỏ check status
  const filteredPackages = packages.filter(pkg => 
    pkg.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    totalPackages: packages.length,
    // Bỏ activePackages
    totalUsers: packages.reduce((sum, pkg) => sum + (pkg.currentUsers || 0), 0),
    totalRevenue: packages.reduce((sum, pkg) => sum + (pkg.price * (pkg.currentUsers || 0)), 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <div className="p-8">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-in slide-in-from-top duration-500">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2 flex items-center gap-3">
              <span className="p-2 bg-purple-100 rounded-lg"><Package className="w-8 h-8 text-purple-600" /></span>
              Service Packages
            </h1>
            <p className="text-gray-500 ml-1">Manage subscription plans and features</p>
          </div>
          <button
            onClick={() => { setEditingPackage(null); setShowPackageModal(true); }}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition flex items-center gap-2 shadow-lg shadow-purple-500/30 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" /> Create Plan
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <div>{error}</div>
          </div>
        )}

        {/* Stats Cards - Đã giảm xuống còn 3 cột và xóa thẻ Active */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Plans', val: stats.totalPackages, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Subscribers', val: stats.totalUsers, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Revenue', val: `$${stats.totalRevenue.toFixed(0)}`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map((stat, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <span className="text-sm text-gray-500 font-medium">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 pl-1">{typeof stat.val === 'number' ? stat.val.toLocaleString() : stat.val}</div>
            </div>
          ))}
        </div>

        {/* Search Only - Đã xóa Select Box Status */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-200 focus:border-purple-500 outline-none"
            />
          </div>
        </div>

        {/* List Packages */}
        {loading && !packages.length ? (
          <div className="text-center py-20"><Loader2 className="w-10 h-10 animate-spin text-purple-600 mx-auto" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPackages.map((pkg) => (
              <div key={pkg.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden flex flex-col">
                <div className={`absolute top-0 right-0 p-3 rounded-bl-2xl text-xs font-bold uppercase tracking-wider ${
                  pkg.type === 'PRO' ? 'bg-purple-100 text-purple-700' : 'bg-indigo-900 text-white'
                }`}>
                  {pkg.type}
                </div>

                <div className="flex items-start justify-between mb-4 mt-2">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition">{pkg.name}</h3>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2 min-h-[40px]">{pkg.description}</p>
                  </div>
                </div>

                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-gray-900">${pkg.price}</span>
                    <span className="text-sm text-gray-500">/{pkg.resetInterval.toLowerCase()}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6 flex-grow">
                  {pkg.features.map((f, i) => ( 
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 mt-auto border-t pt-4">
                  <button onClick={() => { setEditingPackage(pkg); setShowPackageModal(true); }} className="flex-1 py-2 rounded-lg bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-medium transition flex justify-center items-center gap-2">
                    <Edit className="w-4 h-4" /> Edit
                  </button>
                  <button onClick={() => handleDeletePackage(pkg.id)} className="p-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {showPackageModal && (
          <PackageForm
            pkg={editingPackage}
            onSave={handleSavePackage}
            onClose={() => { setShowPackageModal(false); setEditingPackage(null); }}
          />
        )}
      </div>
    </div>
  );
}