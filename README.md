# 🚀 IdeaX Frontend

<div align="center">

![IdeaX Logo](https://img.shields.io/badge/IdeaX-Platform-blue?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.1.1-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-7.1.2-646CFF?style=for-the-badge&logo=vite)

**Nền tảng kết nối Startup và Nhà đầu tư**

[Tính năng](#-tính-năng) • [Cài đặt](#-cài-đặt) • [Cấu trúc](#-cấu-trúc-dự-án) • [API](#-api-integration) • [Đóng góp](#-đóng-góp)

</div>

---

## 📋 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tech Stack](#-tech-stack)
- [Tính năng](#-tính-năng)
- [Cài đặt](#-cài-đặt)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [API Integration](#-api-integration)
- [State Management](#-state-management)
- [Routing](#-routing)
- [Styling](#-styling)
- [Scripts](#-scripts)
- [Environment Variables](#-environment-variables)
- [Deployment](#-deployment)
- [Best Practices](#-best-practices)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Giới thiệu

**IdeaX** là nền tảng kết nối giữa các Startup với Nhà đầu tư, giúp các dự án khởi nghiệp tìm kiếm nguồn vốn và nhà đầu tư khám phá các cơ hội đầu tư tiềm năng.

### Vai trò người dùng

- **👔 Startup**: Tạo và quản lý dự án, tìm kiếm nhà đầu tư, theo dõi tiến độ
- **💼 Investor**: Khám phá dự án, đầu tư, theo dõi portfolio
- **🛡️ Admin**: Quản lý người dùng, dự án, tài chính và hợp đồng

---

## 🛠 Tech Stack

### Core

- **React 19.1.1** - UI Library
- **TypeScript 5.8.3** - Type Safety
- **Vite 7.1.2** - Build Tool & Dev Server

### State Management

- **Redux Toolkit 2.9.0** - Global State Management
- **React Redux 9.2.0** - React Bindings

### UI & Styling

- **Ant Design 5.28.1** - Component Library
- **Ant Design Charts 2.6.6** - Data Visualization
- **Ant Design Icons 5.6.1** - Icon Library
- **Lucide React 0.542.0** - Additional Icons
- **React Icons 5.5.0** - Icon Collection
- **Tailwind CSS 4.1.12** - Utility-first CSS

### Routing & Forms

- **React Router DOM 6.27.0** - Client-side Routing
- **React Hook Form 7.65.0** - Form Management
- **Zod 4.1.12** - Schema Validation
- **@hookform/resolvers 5.2.2** - Form Validation Integration

### HTTP Client

- **Axios 1.12.2** - HTTP Requests with Interceptors

---

## ✨ Tính năng

### 🏠 Public Pages

- ✅ Landing Page với giới thiệu platform
- ✅ Đăng ký tài khoản (Startup/Investor)
- ✅ Đăng nhập với JWT Authentication
- ✅ Responsive Design cho mọi thiết bị

### 👔 Startup Features

| Tính năng | Mô tả |
|-----------|-------|
| 📊 **Dashboard** | Tổng quan dự án, thống kê, hoạt động gần đây |
| 📁 **My Projects** | Quản lý danh sách dự án của startup |
| ➕ **New Project** | Tạo dự án mới với form validation |
| 📝 **Project Details** | Chi tiết dự án, milestones, investors |
| 💰 **Payment** | Quản lý gói dịch vụ, nạp tiền, lịch sử giao dịch |
| 👤 **Profile** | Cập nhật thông tin cá nhân và công ty |
| 🤝 **Meeting Room** | Phòng họp với nhà đầu tư, quản lý hợp đồng |

### 💼 Investor Features

| Tính năng | Mô tả |
|-----------|-------|
| 🔍 **Find Projects** | Tìm kiếm và lọc dự án theo tiêu chí |
| 💎 **Invested Projects** | Danh sách dự án đã đầu tư |
| 📈 **Progress Tracking** | Theo dõi tiến độ dự án đã đầu tư |
| 💳 **Payments** | Nạp tiền, rút tiền, lịch sử giao dịch |
| 👤 **Profile** | Quản lý thông tin nhà đầu tư |
| 🤝 **Meeting Room** | Phòng họp với startup, ký hợp đồng |

### 🛡️ Admin Features

| Tính năng | Mô tả |
|-----------|-------|
| 👥 **User Management** | Quản lý tài khoản, phân quyền, khóa/mở khóa |
| 📂 **Project Management** | Duyệt, từ chối, quản lý tất cả dự án |
| 💰 **Financial Management** | Quản lý giao dịch, nạp/rút tiền |
| 📋 **Room & Contract** | Quản lý phòng họp và hợp đồng |
| 💸 **Withdrawals** | Xử lý yêu cầu rút tiền |

---

## 🚀 Cài đặt

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 hoặc yarn >= 1.22.0

### Clone Repository

```bash
git clone https://github.com/your-org/ideax-frontend.git
cd ideax-frontend
```

### Install Dependencies

```bash
npm install
# hoặc
yarn install
```

### Environment Setup

Tạo file `.env` trong thư mục `Frontend/`:

```env
VITE_API_BASE_URL=https://ideax-backend.onrender.com
VITE_APP_NAME=IdeaX
```

### Run Development Server

```bash
npm run dev
# hoặc
yarn dev
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`

---

## 📁 Cấu trúc dự án

```
IdeaX-FE/
├── Frontend/
│   ├── src/
│   │   ├── assets/              # Static assets (images, fonts)
│   │   │   └── images/
│   │   ├── components/          # Reusable components
│   │   │   ├── common/          # Shared components
│   │   │   ├── investor/        # Investor-specific components
│   │   │   ├── meeting/         # Meeting & contract components
│   │   │   ├── startup/         # Startup-specific components
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── InvestorLayout.tsx
│   │   │   ├── InvestorSidebar.tsx
│   │   │   ├── StartupLayout.tsx
│   │   │   ├── StartupSidebar.tsx
│   │   │   ├── GlobalLoading.tsx
│   │   │   └── InlineLoading.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── interfaces/          # TypeScript interfaces
│   │   │   ├── startup/
│   │   │   ├── auth.ts
│   │   │   ├── meeting.ts
│   │   │   ├── milestone.ts
│   │   │   ├── payment.ts
│   │   │   └── project.ts
│   │   ├── pages/               # Page components
│   │   │   ├── Admin/           # Admin pages
│   │   │   │   ├── AdminWithdrawals.tsx
│   │   │   │   ├── FinancialManagement.tsx
│   │   │   │   ├── ProjectDetails.tsx
│   │   │   │   ├── ProjectManagement.tsx
│   │   │   │   ├── RoomAndContract.tsx
│   │   │   │   └── UserManagement.tsx
│   │   │   ├── Investor/        # Investor pages
│   │   │   │   ├── FindProjects.tsx
│   │   │   │   ├── InvestedProjects.tsx
│   │   │   │   ├── Payments.tsx
│   │   │   │   ├── ProfileInvestor.tsx
│   │   │   │   ├── ProgressTracking.tsx
│   │   │   │   └── Room.tsx
│   │   │   ├── Startup/         # Startup pages
│   │   │   │   ├── Dashboard.tsx
│   │   │   │   ├── MyProjects.tsx
│   │   │   │   ├── NewProject.tsx
│   │   │   │   ├── Payment.tsx
│   │   │   │   ├── Profile.tsx
│   │   │   │   ├── ProjectDetails.tsx
│   │   │   │   └── Roommeet.tsx
│   │   │   ├── Home.tsx
│   │   │   ├── InvestorsJoin.tsx
│   │   │   ├── Login.tsx
│   │   │   └── StartupsJoin.tsx
│   │   ├── routers/             # Route configuration
│   │   │   └── index.tsx
│   │   ├── services/            # API & Redux
│   │   │   ├── constant/
│   │   │   │   ├── apiConfig.ts      # API endpoints
│   │   │   │   ├── axiosInstance.ts  # Axios config
│   │   │   │   └── enumMapping.ts    # Enum mappings
│   │   │   └── features/
│   │   │       ├── auth/             # Auth slice
│   │   │       ├── contract/         # Contract slice
│   │   │       ├── meeting/          # Meeting slice
│   │   │       ├── nda/              # NDA slice
│   │   │       ├── payment/          # Payment slice
│   │   │       └── project/          # Project slice
│   │   ├── types/               # TypeScript types
│   │   │   └── contract.ts
│   │   ├── utils/               # Utility functions
│   │   │   ├── activityLogger.ts
│   │   │   └── projectUtils.ts
│   │   ├── App.tsx              # Root component
│   │   ├── App.css
│   │   ├── index.css            # Global styles
│   │   ├── main.tsx             # Entry point
│   │   └── store.ts             # Redux store
│   └── dist/                    # Build output
├── node_modules/
├── .gitignore
├── eslint.config.js
├── package.json
├── package-lock.json
├── README.md
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

---

## 🔌 API Integration

### Axios Instance

File: `src/services/constant/axiosInstance.ts`

```typescript
// Tự động thêm JWT token vào headers
// Timeout: 30 seconds
// Error handling cho 401 (Unauthorized)
// Minimum delay 500ms cho UX tốt hơn
```

### API Endpoints

File: `src/services/constant/apiConfig.ts`

```typescript
BASE_URL = "https://ideax-backend.onrender.com"

// Auth
- POST /auth/login
- POST /auth/register/startup
- POST /auth/register/investor

// Startup Profile
- GET /startup/profile/:accountId
- PUT /startup/profile/:accountId

// Investor Profile
- GET /investor/profile/:accountId
- PUT /investor/profile/:accountId

// Projects
- GET /projects
- POST /projects
- GET /projects/:id
- PUT /projects/:id

// Payments
- POST /payments/deposit
- POST /payments/withdraw
- GET /payments/history

// Meetings & Contracts
- GET /meetings
- POST /meetings
- POST /contracts
```

### API Usage Example

```typescript
import { api } from '@/services/constant/axiosInstance';

// GET request
const response = await api.get('/projects');

// POST request
const response = await api.post('/projects', projectData);

// Upload file
const formData = new FormData();
formData.append('file', file);
const response = await api.upload('/upload', formData);
```

---

## 🗂 State Management

### Redux Store Structure

```typescript
{
  auth: {
    user: User | null,
    token: string | null,
    isAuthenticated: boolean,
    loading: boolean,
    error: string | null
  },
  project: {
    projects: Project[],
    currentProject: Project | null,
    loading: boolean,
    error: string | null
  },
  payment: {
    transactions: Transaction[],
    balance: number,
    loading: boolean
  },
  meeting: {
    meetings: Meeting[],
    loading: boolean
  },
  contract: {
    contracts: Contract[],
    loading: boolean
  },
  nda: {
    ndas: NDA[],
    loading: boolean
  },
  package: {
    packages: Package[],
    loading: boolean
  }
}
```

### Redux Slices

- **authSlice**: Authentication, user profile, login/logout
- **projectSlice**: Project CRUD, filtering, search
- **paymentSlice**: Transactions, deposits, withdrawals
- **meetingSlice**: Meeting scheduling, management
- **contractSlice**: Contract creation, signing
- **ndaSlice**: NDA management
- **packageSlice**: Service packages

### Usage Example

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '@/services/features/auth/authSlice';
import type { RootState } from '@/store';

const Component = () => {
  const dispatch = useDispatch();
  const { user, loading } = useSelector((state: RootState) => state.auth);

  const handleLogin = async (credentials) => {
    await dispatch(loginUser(credentials));
  };
};
```

---

## 🛣 Routing

### Route Structure

```
/                           → Home (Landing Page)
/login                      → Login Page
/start                      → Startup Registration
/start/investor             → Investor Registration

/startup/*                  → Startup Dashboard (Protected)
  ├── dashboard             → Overview
  ├── my-projects           → Project List
  ├── new-project           → Create Project
  ├── projects/:id          → Project Details
  ├── payment               → Payment Management
  ├── roommeet              → Meeting Room
  └── profile               → Profile Settings

/investor/*                 → Investor Dashboard (Protected)
  ├── find-projects         → Browse Projects
  ├── invested-projects     → Portfolio
  ├── progress-tracking     → Track Progress
  ├── payments              → Payment Management
  ├── room                  → Meeting Room
  └── profile-investor      → Profile Settings

/admin/*                    → Admin Dashboard (Protected)
  ├── user-management       → Manage Users
  ├── project-management    → Manage Projects
  ├── financial-management  → Manage Finances
  ├── room-and-contract     → Manage Meetings
  ├── withdrawals           → Manage Withdrawals
  └── projects/:id          → Project Details
```

### Protected Routes

Routes được bảo vệ bởi authentication check trong Layout components:
- `StartupLayout` - Kiểm tra role === 'startup'
- `InvestorLayout` - Kiểm tra role === 'investor'
- `AdminLayout` - Kiểm tra role === 'admin'

---

## 🎨 Styling

### Ant Design Theme

Sử dụng Ant Design với custom theme colors:

```typescript
Primary Color: #34419A (Blue)
Secondary Color: #3FC7F4 (Cyan)
Success Color: #16a34a (Green)
Error Color: #ef4444 (Red)
```

### Tailwind CSS

Utility-first CSS framework cho custom styling:

```tsx
<div className="flex items-center gap-4 p-6 rounded-lg bg-white shadow-md">
  <h1 className="text-2xl font-bold text-gray-900">Title</h1>
</div>
```

### Global Styles

File: `src/index.css`

- Reset CSS
- Custom scrollbar
- Typography
- Utility classes

---

## 📜 Scripts

```json
{
  "dev": "vite",                    // Start dev server
  "build": "tsc -b && vite build",  // Build for production
  "lint": "eslint .",               // Run ESLint
  "preview": "vite preview"         // Preview production build
}
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

Output: `Frontend/dist/`

### Preview Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

---

## 🌍 Environment Variables

### Development (.env)

```env
VITE_API_BASE_URL=https://ideax-backend.onrender.com
VITE_APP_NAME=IdeaX
VITE_APP_VERSION=1.0.0
```

### Production (.env.production)

```env
VITE_API_BASE_URL=https://api.ideax.com
VITE_APP_NAME=IdeaX
VITE_APP_VERSION=1.0.0
```

### Usage

```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
const appName = import.meta.env.VITE_APP_NAME;
```

---

## 🚢 Deployment

### Build for Production

```bash
npm run build
```

### Deploy to Vercel

```bash
npm install -g vercel
vercel --prod
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod --dir=Frontend/dist
```

### Deploy to AWS S3

```bash
aws s3 sync Frontend/dist/ s3://your-bucket-name --delete
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

---

## 💡 Best Practices

### Code Organization

✅ **DO**
- Tách components nhỏ, tái sử dụng
- Sử dụng TypeScript interfaces
- Lazy load pages với React.lazy()
- Sử dụng custom hooks cho logic phức tạp

❌ **DON'T**
- Hardcode API URLs
- Inline styles (trừ dynamic styles)
- Prop drilling quá sâu
- Duplicate code

### Performance

- ✅ Code splitting với Vite
- ✅ Lazy loading routes
- ✅ Memoization với React.memo, useMemo, useCallback
- ✅ Optimize images (WebP, lazy loading)
- ✅ Bundle size optimization

### Security

- ✅ JWT token trong localStorage
- ✅ Auto logout khi token expired
- ✅ Input validation với Zod
- ✅ XSS protection
- ✅ HTTPS only

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-feature

# Commit với message rõ ràng
git commit -m "feat: add project filtering"

# Push và tạo PR
git push origin feature/new-feature
```

---

## 🐛 Troubleshooting

### Common Issues

#### 1. API Connection Failed

```bash
# Kiểm tra BASE_URL trong apiConfig.ts
# Kiểm tra backend đang chạy
# Kiểm tra CORS settings
```

#### 2. Build Failed

```bash
# Clear cache và rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### 3. TypeScript Errors

```bash
# Rebuild TypeScript
npm run build
# Hoặc check types
tsc --noEmit
```

#### 4. Slow Development Server

```bash
# Clear Vite cache
rm -rf node_modules/.vite
npm run dev
```

#### 5. Authentication Issues

```bash
# Clear localStorage
localStorage.clear()
# Logout và login lại
```

---

## 📚 Documentation

### Component Documentation

Mỗi component phức tạp nên có JSDoc:

```typescript
/**
 * ProjectCard component hiển thị thông tin dự án
 * @param {Project} project - Dữ liệu dự án
 * @param {Function} onView - Callback khi click xem chi tiết
 * @param {Function} onEdit - Callback khi click chỉnh sửa
 */
```

### API Documentation

Backend API docs: [Swagger UI](https://ideax-backend.onrender.com/swagger-ui.html)

---

## 🤝 Đóng góp

### Quy trình đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

### Commit Convention

```
feat: Tính năng mới
fix: Sửa bug
docs: Cập nhật documentation
style: Format code, không ảnh hưởng logic
refactor: Refactor code
test: Thêm tests
chore: Cập nhật dependencies, config
```

---

## 📄 License

This project is licensed under the MIT License.

---

## 👥 Team

- **Frontend Lead**: [Your Name]
- **Backend Lead**: [Backend Dev Name]
- **UI/UX Designer**: [Designer Name]
- **Project Manager**: [PM Name]

---

## 📞 Support

- 📧 Email: support@ideax.com
- 💬 Discord: [IdeaX Community](https://discord.gg/ideax)
- 📖 Docs: [docs.ideax.com](https://docs.ideax.com)

---

<div align="center">

**Made with ❤️ by IdeaX Team**

⭐ Star us on GitHub — it motivates us a lot!

</div>
