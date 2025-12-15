import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import App from './App';
import RegisterPage from './pages/RegisterPage/RegisterPage';
import LoginPage from './pages/Loginpage/LoginPage';
import Homepage from './pages/Homepage/Homepage';
import SongDetailPage from './pages/SongDetailPage/SongDetailPage';
import Genres from './pages/Genres/Genres';
import ViewMore from './pages/Genres/ViewSongs'; // Đây là trang chi tiết 1 Genre (ViewSongs)
import Artists from './pages/Artists/Artists';
import DownloadPage from './pages/DownloadPage/DownloadPage';
import FavouritePage, { FavoritesProvider } from './pages/FavouritePage/FavouritePage';
import Albums from './pages/Albums/Albums';
import AlbumDetail from './pages/Albums/AlbumDetail';
import HistoryPage from './pages/HistoryPage/HistoryPage';
import TopTracks from './pages/TopTracks/TopTracks';
import AdminLayout from './Layouts/AdminLayout';
import AdminDashboard from './pages/AdminDashboard/AdminDashboard';
import ManageArtists from './pages/AdminDashboard/ArtistMangementPage';
import AlbumManagementPage from './pages/AdminDashboard/AlbumManagementPage';
import SongManagement from './pages/AdminDashboard/SongManagement';
import AddNewSong from './components/admin/AddNewSong';

import GenresManagement from './pages/AdminDashboard/GenresManagement';
import AdminUserManagement from './pages/AdminDashboard/UserManagementPage';
import AddUserPage from './components/admin/AddUserPage';
import EditUserPage from './components/admin/EditUserPage';
import SettingsManagementPage from './pages/AdminDashboard/Settings';
import AddNewAlbum from './components/admin/AddNewAlbum';

import './index.css';
import GenresViewMore from './pages/Genres/GenresViewmore'; // Đây là trang xem tất cả Genres
import ArtistDetail from './pages/Artists/ArtistDetail';
import ProtectedRoute from './components/ProtectedRoute';

import AdminArtistEdit from './components/admin/AdminArtistEdit'
import PaymentPage from './pages/PaymentPage/PaymentPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import PackageManagement from './pages/AdminDashboard/PackageManagement';
import SettingsPage from './pages/UserSettings/UserSettings';

import ScrollToTop from './utils/ScrollToTop';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <FavoritesProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            {/* Routes with App layout */}
            <Route path="/" element={<App />}>
              <Route index element={<Homepage />} />
              <Route path="favourite" element={<FavouritePage />} />
              <Route path="song/:songId" element={<SongDetailPage />} />
              <Route path="download" element={<DownloadPage />} />

              <Route path="genres" element={<Genres />} />

              <Route path="all-genres" element={<GenresViewMore />} />

              {/* Route xem chi tiết 1 Genre (ViewSongs) */}
              <Route path="genres/:genreId" element={<ViewMore />} />

              <Route path="artists" element={<Artists />} />
              <Route path="albums" element={<Albums />} />
              <Route path="album/:id" element={<AlbumDetail />} />
              <Route path="history" element={<HistoryPage />} />
              <Route path="top-tracks" element={<TopTracks />} />

              <Route path="/artists/:id" element={<ArtistDetail />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="profile" element={<ProfilePage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUserManagement />} />
              <Route path="users/add" element={<AddUserPage />} />
              <Route path="users/edit/:id" element={<EditUserPage />} />
              <Route path="albums" element={<AlbumManagementPage />} />
              <Route path="artists" element={<ManageArtists />} />
              <Route path="songs" element={<SongManagement />} />
              <Route path="songs/add" element={<AddNewSong />} />
              <Route path="albums/add" element={<AddNewAlbum />} />

              <Route path="genres" element={<GenresManagement />} />
              <Route path="settings" element={<SettingsManagementPage />} />
              <Route path="artists/edit/:artistId" element={<AdminArtistEdit />} />
              <Route path="packages" element={<PackageManagement />} />
            </Route>

            <Route path="/register" element={<RegisterPage />} />

          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </Provider>
  </React.StrictMode>
);