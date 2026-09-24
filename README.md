# Product Admin Dashboard

A modern product management dashboard built with Next.js • React • Tailwind CSS • Axios. This application provides a complete admin interface for managing products with authentication, search, filtering, pagination, and CRUD operations.

🔗 **Live Demo**: [Add your Vercel/Netlify link here]

## 📋 Features Implemented

### ✅ Core Requirements
- **Authentication**: Login page with credentials (username: `emilys`, password: `emilyspass`)
- **Protected Routes**: Middleware-based route protection with automatic redirect to login
- **Product List**: Responsive layout - table view on desktop, card grid on mobile
- **Pagination**: Complete pagination with page numbers, Previous/Next buttons, page size selector (10/20/50), and "Showing X–Y of Z" display
- **Search**: Debounced search (500ms) with automatic page reset and request cancellation
- **Filter & Sort**: Category filtering and sorting by price, rating, or title
- **Product Details**: Individual product pages with images, reviews, and full information
- **CRUD Operations**: Add, edit, and delete products with form validation and confirmation modals
- **Loading States**: Spinner for loading, empty state messages, and error state with retry button
- **INR Currency**: All prices displayed in Indian Rupees (₹) with proper locale formatting

### 🎨 UI/UX Features
- Dark mode support
- Responsive design (mobile-first)
- Toast notifications for user feedback
- Optimistic UI updates for instant feedback
- Accessible form validation
- Clean, modern interface with Tailwind CSS v4

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone [your-github-repo-url]
cd [repo-name]
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Login Credentials
- **Username**: `emilys`
- **Password**: `emilyspass`

## 📁 Project Structure

```
src/
├── app/
│   ├── login/              # Login page
│   ├── products/           # Product list and detail pages
│   │   ├── [id]/          # Dynamic product detail page
│   │   ├── layout.tsx     # Dashboard layout with navbar
│   │   └── page.tsx       # Product list with search/filter/pagination
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page (redirects to /products)
├── components/            # Reusable UI components
│   ├── DeleteConfirmModal.tsx
│   ├── EmptyState.tsx
│   ├── ErrorState.tsx
│   ├── Pagination.tsx
│   ├── ProductCard.tsx    # Mobile card view
│   ├── ProductForm.tsx    # Add/Edit form
│   ├── SearchBar.tsx
│   ├── Spinner.tsx
│   └── Table.tsx          # Desktop table view
├── lib/
│   ├── auth.ts            # Auth utilities
│   ├── axios.ts           # Shared Axios configuration
│   └── currency.ts        # INR currency utilities
├── services/
│   ├── authService.ts     # Login API
│   └── productService.ts  # Product API calls
└── middleware.ts          # Route protection
```

## 🛠️ Technical Implementation

### Key Design Decisions

1. **Shared Axios Instance** (`src/lib/axios.ts`)
   - Single configuration for all API calls
   - Request interceptor automatically adds auth token
   - Response interceptor handles 401 errors globally (clears token and redirects)

2. **URL State Management**
   - All filters stored in URL query parameters: `page`, `pageSize`, `q`, `category`, `sort`, `order`
   - Enables bookmarking, sharing links, and state persistence on refresh
   - Page resets to 1 when search or category changes

3. **Race Condition Prevention**
   - Axios CancelToken cancels previous search requests
   - 500ms debounce prevents excessive API calls
   - `isCancel()` check prevents old results from overwriting new ones

4. **Search + Filter Conflict Resolution**
   - **Decision**: Search takes precedence over category filter
   - **Reason**: DummyJSON API `/products/search?q=` doesn't support category parameters
   - **Implementation**: Category dropdown is disabled when search is active
   - Category filter is cleared when user starts searching

5. **Optimistic UI Updates**
   - **Challenge**: DummyJSON API doesn't persist POST/PUT/DELETE operations
   - **Solution**: Update local state immediately for instant feedback
   - API calls are made but UI doesn't rely on persistence
   - Toast notifications confirm actions to users

6. **Input Validation & Sanitization**
   - Invalid URL params (`?page=abc`) sanitized to defaults
   - Page numbers validated: `Math.max(1, pageParam)`
   - Page size validated: defaults to 10 if invalid value provided
   - Out-of-range pages (e.g., `?page=999`) handled gracefully

7. **Double-Click Prevention**
   - `isLoading` state on login button prevents multiple submissions
   - `isSubmitting` state on forms prevents duplicate saves
   - All action buttons disabled during processing

### INR Currency Implementation
- Created utility module (`src/lib/currency.ts`) for currency conversion
- USD to INR conversion using fixed rate (83.45)
- Uses browser's `Intl.NumberFormat` API for proper Indian locale formatting
- Consistent formatting across all components (Table, ProductCard, ProductDetail)

## 📝 Design Notes

### Problem Faced & Solution

**Problem**: Fast typing in the search box caused race conditions where old search results would replace newer ones, especially noticeable when the API was slow.

**Solution**: Implemented a two-part approach:
1. **Debouncing**: Added 500ms delay before making API calls
2. **Request Cancellation**: Used Axios CancelToken to cancel in-flight requests when new search starts
3. **Error Handling**: Checked `axios.isCancel()` to silently ignore cancelled requests

This ensures the UI always shows results from the most recent search query, even when typing quickly.


## 🧪 Testing Checklist

- [x] Login with valid credentials
- [x] Login with invalid credentials (shows error)
- [x] Protected routes redirect to login when not authenticated
- [x] Logout clears token and redirects to login
- [x] Product list loads with pagination
- [x] Page size change (10/20/50) updates display
- [x] Search with debouncing (type fast, no race conditions)
- [x] Search resets to page 1
- [x] Category filter (disabled during search)
- [x] Sort by price, rating, title
- [x] URL state persists on page refresh
- [x] Responsive design (table on desktop, cards on mobile)
- [x] Product detail page shows full information
- [x] Add new product (optimistic UI update)
- [x] Edit existing product (optimistic UI update)
- [x] Delete product with confirmation modal
- [x] Loading states during API calls
- [x] Empty state when no products found
- [x] Error state with retry button
- [x] INR currency formatting on all prices

## 🚀 Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Vercel auto-detects Next.js configuration
5. Click "Deploy"

### Netlify Deployment

1. Push your code to GitHub
2. Visit [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect to GitHub and select your repository
5. Build settings (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy site"

## 📦 Built With

**Next.js • React • Tailwind CSS • Axios**

Additional libraries:
- TypeScript - Type safety
- React Hot Toast - Notifications
- js-cookie - Cookie management
- Lucide React - Icons
- DummyJSON API - Backend

## 📄 License

This project is built as an assignment submission.

---

Built with ❤️ using Next.js and React
