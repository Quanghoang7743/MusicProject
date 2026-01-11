# 🎵 The Miraculous - Music Streaming Platform

Ứng dụng phát nhạc trực tuyến hiện đại được xây dựng với React và Vite, cung cấp trải nghiệm nghe nhạc mượt mà với giao diện đẹp mắt và nhiều tính năng quản lý nhạc cá nhân.

## Tính Năng Chính

### Phát Nhạc
- Phát nhạc trực tuyến mượt mà với player control hiện đại
- Hỗ trợ điều khiển phát: play/pause, next/previous, shuffle, repeat
- Thanh tiến trình và điều chỉnh âm lượng
- Hiển thị thông tin bài hát, album, nghệ sĩ

### Quản Lý Người Dùng
- Đăng ký và đăng nhập tài khoản
- Quản lý profile cá nhân
- Phân quyền người dùng (User/Admin)
- Xác thực với JWT và auto-refresh token

### Quản Lý Thư Viện
- Duyệt các bài hát theo Album, Nghệ sĩ, Thể loại
- Tìm kiếm bài hát nhanh chóng
- Xem danh sách Top Tracks phổ biến
- Lịch sử nghe nhạc cá nhân

###  Tính Năng Cá Nhân Hóa
- Yêu thích bài hát/album/nghệ sĩ
- Tải xuống bài hát để nghe offline
- Tạo và quản lý playlist
- Gợi ý bài hát dựa trên sở thích

###  Gói Premium
- Hệ thống thanh toán cho gói VIP
- Tích hợp các tính năng premium
- Quản lý subscription

### Quản Trị (Admin)
- Dashboard quản lý toàn diện
- Quản lý người dùng
- Quản lý bài hát, album, nghệ sĩ, thể loại
- Quản lý gói dịch vụ
- Thống kê và báo cáo

## Công Nghệ Sử Dụng

### Frontend
- **React 18.2** - Thư viện UI hiện đại
- **Vite 7.1** - Build tool siêu nhanh
- **React Router DOM 6.23** - Routing cho SPA
- **Redux Toolkit 2.9** - Quản lý state toàn cục
- **Tailwind CSS 4.1** - Styling utility-first
- **Ant Design 5.27** - UI component library
- **Recharts 3.3** - Biểu đồ và thống kê
- **Lucide React** - Icon library
- **Axios** - HTTP client với interceptors

### Dev Tools
- **ESLint** - Code quality và linting
- **PostCSS** - CSS transformation
- **Autoprefixer** - CSS vendor prefixes

### Backend API
- RESTful API với JWT authentication
- Base URL: `http://localhost:3005/api`
- Auto-refresh token khi hết hạn

## 📁 Cấu Trúc Dự Án

```
MusicProject/
├── src/
│   ├── components/       # Các component UI tái sử dụng
│   ├── pages/            # Các page components
│   │   ├── Homepage/
│   │   ├── Albums/
│   │   ├── Artists/
│   │   ├── Genres/
│   │   ├── TopTracks/
│   │   ├── FavouritePage/
│   │   ├── DownloadPage/
│   │   ├── HistoryPage/
│   │   ├── PaymentPage/
│   │   ├── ProfilePage/
│   │   ├── AdminDashboard/
│   │   └── ...
│   ├── services/         # API service layer
│   │   ├── authService.js
│   │   ├── songService.js
│   │   ├── albumService.js
│   │   ├── artistService.js
│   │   └── ...
│   ├── redux/            # Redux store và slices
│   ├── routes/           # Route configuration
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── config/           # App configuration
│   │   └── api.js        # Axios instance với interceptors
│   ├── App.jsx           # Root component
│   └── main.jsx          # Entry point
├── public/               # Static assets
└── package.json
```

## Luồng Hoạt Động

### 1. Đăng Ký & Đăng Nhập
```
User truy cập → Click Register/Login → Nhập thông tin 
→ Backend xác thực → Nhận JWT tokens 
→ Lưu vào localStorage → Redirect đến trang chủ/admin
```

### 2. Xác Thực & Phân Quyền
```
Mỗi API request → Interceptor thêm Bearer token 
→ Backend verify token → Nếu 401: auto-refresh token 
→ Retry request với token mới → Thành công/Thất bại
```

### 3. Phát Nhạc
```
User chọn bài hát → Dispatch action đến Redux store 
→ Update currentTrack state → Component PlayerControl nhận state 
→ useAudio hook xử lý phát nhạc → Ghi nhận lượt phát vào API
```

### 4. Quản Lý Yêu Thích
```
User click yêu thích → Call favouritesService API 
→ Backend lưu vào DB → Update UI state → Hiển thị trạng thái mới
```

### 5. Admin Dashboard
```
Admin login → Check role === 'ADMIN' → Redirect /admin 
→ Access các trang quản lý (Users, Songs, Albums, Artists, Genres) 
→ CRUD operations qua Admin services
```

## Cài Đặt & Sử Dụng

### Yêu Cầu
- Node.js >= 16.x
- npm hoặc yarn
- Backend API đang chạy tại `http://localhost:3005`

### Cài Đặt Dependencies

```bash
npm install
# hoặc
yarn install
```

### Chạy Development Server

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173` (Vite default port)

### Build cho Production

```bash
npm run build
# hoặc
yarn build
```

### Preview Production Build

```bash
npm run preview
# hoặc
yarn preview
```

### Lint Code

```bash
npm run lint
# hoặc
yarn lint
```

Thay đổi `BASE_URL` để kết nối với backend server của bạn.

### Authentication Flow
- Access Token: Lưu trong `localStorage` với key `authToken`
- Refresh Token: Lưu trong `localStorage` với key `refreshToken`
- User Info: Lưu trong `localStorage` với key `currentUser`

##  Responsive

Ứng dụng hỗ trợ đầy đủ responsive cho:
- 📱 Mobile (< 768px)
- 📱 Tablet (768px - 1024px)
- 💻 Desktop (>= 1024px)

## Features Highlights

### Sidebar Navigation
- Collapsible sidebar trên desktop
- Mobile drawer menu
- Active route highlighting
- Smooth transitions

### Player Control
- Sticky bottom player
- Volume control
- Progress bar với seek functionality
- Queue management

### Search
- Real-time search
- Search qua bài hát, album, nghệ sĩ
- Search suggestions



---
