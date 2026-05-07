# 📘 GoEventify Frontend - Complete System Documentation

**Last Updated:** May 7, 2026  
**Project:** BookMyEvent - Multi-role Event Management Platform  
**Version:** 1.0  
**Frontend Framework:** React 18 + Vite + Tailwind CSS + Material-UI  

---

## 📑 Table of Contents

1. [System Overview](#system-overview)
2. [Complete Frontend Flow](#complete-frontend-flow)
3. [Frontend Architecture](#frontend-architecture)
4. [Authentication & Authorization](#authentication--authorization)
5. [Page-by-Page Breakdown](#page-by-page-breakdown)
6. [Navigation Structure](#navigation-structure)
7. [Component Documentation](#component-documentation)
8. [Forms Documentation](#forms-documentation)
9. [Tables & Data Views](#tables--data-views)
10. [Dashboard & Analytics Sections](#dashboard--analytics-sections)
11. [Role-Based Access Control](#role-based-access-control)
12. [State Management & Architecture](#state-management--architecture)
13. [API Mapping](#api-mapping)
14. [Responsive Design Details](#responsive-design-details)
15. [UI/UX Notes](#uiux-notes)
16. [File & Folder Mapping](#file--folder-mapping)
17. [Workflow Diagrams](#workflow-diagrams)
18. [Missing/Incomplete Features](#missingincomplete-features)

---

## System Overview

**GoEventify** is a comprehensive event management platform connecting event organizers (users), service providers (vendors), admin managers, and potential marketers. The platform allows users to:
- Browse and filter event services and vendors
- Book vendors for their events
- Review and rate vendors after events
- Track booking status and manage cancellations

Vendors can:
- Create and manage service profiles
- Accept/reject booking requests
- Set availability shifts
- Manage event gallery and packages
- Track bookings and revenue

Admins can:
- Manage all users and vendors
- Create and categorize services
- Approve bookings
- View system analytics and KPIs

---

## Complete Frontend Flow

### 1. **Initial App Load → Authentication Check**

```
App.jsx loads → AuthProvider initializes
  ↓
localStorage has token? → YES → Check token expiration
  ↓
Token valid? → YES → Restore user session (AuthContext)
  ↓
AuthContext updated → All routes now protected/accessible
  ↓
User navigates → ProtectedRoute checks role → Routes rendered accordingly
```

### 2. **Unauthenticated User Journey**

```
Visit "/" (Home)
  ↓ Browse public pages (services, vendors, categories)
  ↓ Click "View Vendor" → VendorDetail page
  ↓ Click "Book Now" → useAuthRedirect redirects to "/login"
  ↓
Login/Register Flow:
  Login → API call (/User/Login) → token + role received
  ↓
  Token + user data stored in localStorage + AuthContext
  ↓
  Navigate to role-based dashboard (/user/dashboard, /vendor/dashboard, /admin/dashboard)
```

### 3. **Authenticated User Dashboard Flow**

```
Login successful with role
  ↓
MainLayout renders (Navbar + Sidebar + Outlet)
  ↓ Menu configured based on role (menuConfig)
  ↓
User clicks menu item → Navigate to page
  ↓ Page fetches data via services
  ↓ Component renders with data/loading/error states
```

### 4. **Booking Flow (User Perspective)**

```
Browse Services/Categories
  ↓ Select Sub-service
  ↓ View Vendors for that Service
  ↓ Click on Vendor → VendorDetail page
  ↓
VendorDetail page loads:
  - Vendor profile info
  - Services/packages
  - Availability shifts (calendar)
  - Reviews and ratings
  ↓
Click "Book Now" → ShowBookingModal
  ↓ Select date + package + time
  ↓ Submit booking
  ↓
API: POST /Booking/InsertBooking
  ↓
Booking created with status: "pending"
  ↓
User redirected to /user/bookings
  ↓
Notification sent to vendor + admin
```

### 5. **Booking Approval Flow**

```
User creates booking (status: pending)
  ↓
Vendor receives notification → /vendor/bookings
  ↓ Vendor accepts or rejects
  ↓ If accepted → status: "pending" (awaiting admin approval)
  ↓
Admin receives notification → /admin/bookings
  ↓ Admin approves or rejects
  ↓ If approved → OTP generated + sent to user
  ↓ User verifies OTP → Booking confirmed
  ↓
After event → Booking status: "awaiting_review"
  ↓
User receives email with review link
  ↓ Clicks link → /review/:bookingId
  ↓ Submits review
  ↓ Status: "completed"
```

### 6. **State Management Flow**

```
User logs in → AuthContext (useAuth)
  ↓
token + user data stored in localStorage
  ↓ Consumed by:
  - ProtectedRoute (role checks)
  - Navbar (display user info)
  - Services (API calls with auth headers)
  - Page components (user-specific data)
  ↓
Logout → localStorage cleared → AuthContext cleared → Redirect to /login
```

---

## Frontend Architecture

### **Folder Structure**

```
Frontend/src/
├── App.jsx                          # Main app component with all routes
├── main.jsx                         # App entry point
├── App.css                          # Global styles
├── index.css                        # Base styles
│
├── context/                         # Global state management
│   ├── AuthContext.jsx              # Authentication & user state
│   └── ThemeContext.jsx             # Theme (light/dark mode)
│
├── hooks/                           # Custom hooks
│   ├── useAuth.js                   # Auth status checking
│   ├── useAuthRedirect.js           # Require authentication for actions
│   ├── useApiCall.js                # Wrapper for API calls with loading/error
│   ├── usePageTracking.js           # Page view analytics
│   └── usePWAInstall.js             # PWA installation prompt
│
├── routes/                          # Route protection
│   └── ProtectedRoute.jsx           # Wrapper for protected routes with role checks
│
├── pages/                           # Page components (full-page views)
│   ├── HomePage.jsx                 # Main landing page
│   ├── AboutPage.jsx                # About section
│   ├── ContactPage.jsx              # Contact form
│   ├── WhyUsPage.jsx                # Why choose us page
│   ├── NotificationsPage.jsx        # All notifications
│   ├── ReviewPage.jsx               # Public review form (via email link)
│   ├── VendorDetail.jsx             # Single vendor detail page
│   ├── VendorsByService.jsx         # Vendors for specific service
│   ├── ServicesByCategory.jsx       # Services within a category
│   ├── SubServicesPage.jsx          # Sub-services listing
│   ├── AllSubServicesPage.jsx       # All services globally
│   ├── AllVendorsPage.jsx           # All vendors globally
│   ├── EmergencyReset.jsx           # Emergency troubleshooting page
│   ├── VerifyEmail.jsx              # Email verification page
│   ├── EmailVerification.jsx        # Email verification handler
│   ├── TestEmailVerification.jsx    # Test email verification (dev)
│   │
│   ├── Auth/                        # Authentication pages
│   │   ├── Login.jsx                # User login
│   │   ├── Register.jsx             # User registration
│   │   ├── ForgotPassword.jsx       # Password reset initiation
│   │   ├── ResetPassword.jsx        # Password reset completion
│   │   └── LoginRedirect.jsx        # Login redirect logic
│   │
│   ├── Category/                    # Category-specific pages
│   │   ├── Weddings.jsx             # Wedding services
│   │   ├── CorporateEvents.jsx      # Corporate events
│   │   ├── ConcertsFestivals.jsx    # Concerts & festivals
│   │   ├── BirthdayParties.jsx      # Birthday party services
│   │   ├── FashionShows.jsx         # Fashion shows
│   │   ├── Exhibitions.jsx          # Exhibitions
│   │   └── CategoryTemplate.jsx     # Reusable category template
│   │
│   └── Dashboards/                  # Role-based dashboards
│       ├── User/                    # User dashboard
│       │   ├── UserDashboard.jsx    # User overview & KPIs
│       │   └── MyBookings.jsx       # User's bookings management
│       │
│       ├── Vendor/                  # Vendor dashboard
│       │   ├── VendorDashboard.jsx  # Vendor overview & KPIs
│       │   ├── VendorProfileSetup.jsx   # Vendor profile creation/edit
│       │   ├── VendorBookings.jsx   # Vendor's booking requests
│       │   ├── VendorShiftPage.jsx  # Vendor availability management
│       │   ├── MyEvents.jsx         # Vendor's events
│       │   ├── VendorGallery.jsx    # Event image gallery
│       │   ├── MyPackege.jsx        # Vendor's packages
│       │   ├── VendorSettings.jsx   # Vendor settings
│       │   └── VendorManualReservations.jsx # Manual booking creation
│       │
│       └── Admin/                   # Admin dashboard
│           ├── AdminDashboard.jsx   # Admin overview & KPIs
│           ├── AdminUsers.jsx       # User management
│           ├── AdminBookings.jsx    # All bookings approval
│           ├── AddServices.jsx      # Service category management
│           ├── MainService.jsx      # Sub-service management
│           ├── AdminSubscriptions.jsx   # Subscription management
│           └── ManualReservations.jsx   # Manual booking creation
│
├── components/                      # Reusable components
│   ├── LoadingSpinner.jsx           # Loading indicator
│   ├── ErrorBoundary.jsx            # Error catching wrapper
│   ├── ScrollToTop.jsx              # Auto-scroll on navigation
│   ├── RouteDebugger.jsx            # Route logging (dev)
│   ├── ChangePassword.jsx           # Password change form
│   ├── NotificationBell.jsx         # Notification icon + dropdown
│   ├── ReviewModal.jsx              # Review submission modal
│   ├── OTPVerificationModal.jsx     # OTP entry modal
│   ├── TermsAndConditionsModal.jsx  # T&C acceptance modal
│   ├── SubscriptionPayment.jsx      # Payment form
│   ├── SubscriptionStatus.jsx       # Subscription status display
│   ├── BookingStatusFlow.jsx        # Booking status timeline
│   ├── HomePageWrapper.jsx          # Home page layout wrapper
│   │
│   ├── layout/                      # Layout components
│   │   ├── MainLayout.jsx           # Protected area layout
│   │   ├── Navbar.jsx               # Top navigation bar
│   │   └── Sidebar.jsx              # Left sidebar menu
│   │
│   ├── auth/                        # Auth-related components
│   │   └── LoginRedirect.jsx        # Redirect for login
│   │
│   ├── common/                      # Common utility components
│   │   └── StateComponents.jsx      # Loading, Error, Empty states
│   │
│   └── mainpage/                    # Landing page sections
│       ├── HomeNavbar.jsx           # Landing page navbar
│       ├── HeroSection.jsx          # Hero banner with slides
│       ├── ServiceSection.jsx       # Main service categories
│       ├── SubServicesSection.jsx   # Sub-services showcase
│       ├── ShowcaseSection.jsx      # Featured vendors showcase
│       ├── Testimonials.jsx         # Customer testimonials
│       ├── WhyChooseUs.jsx          # USP section
│       ├── AboutSection.jsx         # About us section
│       ├── CTASection.jsx           # Call-to-action section
│       ├── Footer.jsx               # Page footer
│       ├── FAQSection.jsx           # FAQ section
│       ├── ContactPopup.jsx         # Contact form popup
│       ├── BookingSection.jsx       # Booking CTA
│       ├── Vendorsection.jsx        # Featured vendors
│       ├── EventStackShowcase.jsx   # Event examples
│       ├── TiltedCard.jsx           # Card component with tilt
│       ├── HexCollage.jsx           # Hexagonal image layout
│       ├── CircularGallery.jsx      # Circular image gallery
│       ├── Headers.jsx              # Header variations
│       ├── Head.jsx                 # Header component
│       ├── Stack.jsx                # Stack layout
│       └── SocialSidebar.jsx        # Social media links
│
├── services/                        # API service layers
│   ├── index.js                     # Export all services
│   ├── axiosConfig.js               # Axios instance with interceptors
│   ├── bookingService.js            # Booking API calls
│   ├── vendorService.js             # Vendor API calls
│   ├── adminService.js              # Admin API calls
│   ├── dashboardService.js          # Dashboard data API calls
│   ├── otpService.js                # OTP API calls
│   ├── reviewService.js             # Review API calls
│   ├── notificationService.js       # Notification API calls
│   ├── subscriptionService.js       # Subscription API calls
│   └── shiftAvailabilityService.js  # Shift availability API calls
│
├── utils/                           # Utility functions
│   ├── api.js                       # API base URL config
│   ├── axiosConfig.js               # Axios setup
│   ├── formValidation.js            # Form validation functions
│   ├── errorHandler.js              # Error handling logic
│   ├── tokenValidation.js           # Token expiration checks
│   ├── vendorUtils.js               # Vendor-specific utilities
│   ├── analytics.js                 # Analytics tracking
│   └── ERROR_HANDLING_GUIDE.md      # Error handling documentation
│
├── config/                          # Configuration files
│   ├── menuconfig.jsx               # Role-based menu configuration
│   └── imageReplacements.js         # Image fallback config
│
├── theme/                           # Theme configuration
│   └── theme.js                     # MUI theme definition
│
├── style/                           # CSS files
│   ├── Calendar.css                 # Calendar styling
│   ├── homepage.css                 # Homepage styles
│   └── homepage.css                 # Additional styles
│
└── assets/                          # Static assets
    └── react.svg                    # React logo
```

### **Technology Stack**

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | React 18 | Component-based UI |
| **Build Tool** | Vite | Fast development server & bundling |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **UI Components** | Material-UI (MUI) | Pre-built components for tables, modals, forms |
| **Routing** | React Router v6 | Client-side routing |
| **HTTP Client** | Axios | API communication with interceptors |
| **State Management** | React Context API | Global auth & theme state |
| **Animations** | Framer Motion | Page and component animations |
| **Toast Notifications** | React Hot Toast | User feedback messages |
| **Icons** | React Icons & Heroicons | SVG icon libraries |
| **Calendar** | React Calendar | Date selection widget |
| **Charts** | Recharts | Data visualization |
| **Forms** | Native + MUI | Form handling |
| **Linting** | ESLint | Code quality |

### **State Management Architecture**

**Global State (Context API):**
```javascript
// AuthContext - User authentication & session
- user: { role, email, user_id, first_name, last_name }
- loading: boolean (checking auth on app load)
- login(data): Store token + user
- logout(): Clear auth data
- refreshSession(): Validate token

// ThemeContext - Light/dark mode
- theme: object
- toggleTheme(): Switch mode
```

**Local State (Component State):**
- Form data (useState)
- Loading/error states
- Modal open/close states
- Filter/sort selections
- Pagination states

**API Response Caching:**
- Not implemented (real-time data preferred)
- Each page re-fetches data on mount

---

## Authentication & Authorization

### **Authentication Flow**

**Login Process:**
1. User enters email + password → Login page
2. POST to `/User/Login` with credentials
3. Backend returns: `{ token, role, email, user_id, first_name, last_name }`
4. Token + user data stored in `localStorage`
5. `AuthContext.login()` called to update global state
6. User redirected to role-based dashboard

**Token Storage:**
```javascript
localStorage.setItem("token", data.token);           // JWT token
localStorage.setItem("user", JSON.stringify(user));  // User object
localStorage.setItem("role", user.role);             // User role
```

**Token Validation:**
```javascript
// Token checked on app load in AuthProvider
// If expired → checkAndCleanAuth() clears localStorage
// User redirected to /login
```

**Session Persistence:**
- Token remains in localStorage across page refreshes
- AuthContext restores session on app load
- Logged-in users stay logged in until they logout or token expires

### **Authorization (Role-Based Access Control)**

**User Roles:**
1. **user** - Event organizers/customers
2. **vendor** - Service providers
3. **admin** - System administrators
4. **marketer** (placeholder) - Future marketing module

**Route Protection:**
```javascript
<ProtectedRoute allowedRoles={["admin"]}>
  <AdminDashboard />
</ProtectedRoute>
```

**Protected Routes Structure:**
```
Public Routes (no auth required):
  / (Home)
  /login, /register, /forgot-password, /reset-password
  /services, /vendors, /vendor/:vendorId
  /category/* (all category pages)
  /review/:bookingId (email review link)
  /about, /contact, /why-us

Protected Routes (auth required):
  /user/* (user dashboard & bookings)
  /vendor/* (vendor dashboard & management)
  /admin/* (admin panel)
  /user/dashboard, /user/bookings
  /vendor/dashboard, /vendor/bookings, /vendor/shifts, etc.
  /admin/dashboard, /admin/users, /admin/bookings, etc.
```

---

## Page-by-Page Breakdown

### **PUBLIC PAGES**

#### **1. HomePage (Route: `/`)**
- **Purpose:** Main landing page showcasing event services
- **Components Used:**
  - HomeNavbar (with login/register links)
  - HeroSection (rotating carousel with service highlights)
  - ServicesSection (main service categories)
  - SubServicesSection (sub-category showcase)
  - ShowcaseSection (featured vendors)
  - Testimonials (customer reviews)
  - WhyChooseUs (USP section)
  - AboutSection
  - CTASection (call-to-action)
  - Footer
  - SocialSidebar
- **Data Displayed:**
  - Service categories
  - Featured vendors
  - Testimonials (static or from API)
- **Actions Available:**
  - Browse services/categories
  - Click vendor to view details
  - Navigate to Login/Register
  - Contact form submission
- **APIs Used:** None (mostly static content)
- **Responsive Behavior:** Mobile-optimized hero, stacked sections

---

#### **2. VendorDetail (Route: `/vendor/:vendorId`)**
- **Purpose:** Display comprehensive vendor information & booking interface
- **Route Parameters:** `vendorId` (numeric ID)
- **Components Used:**
  - HomeNavbar
  - Vendor profile card (name, location, contact)
  - Services/Packages table
  - Availability calendar (react-calendar)
  - Reviews section
  - Rating statistics
  - Gallery slider
  - Booking modal
  - Footer
- **Data Displayed:**
  - Vendor name, location, contact, years of experience
  - Business description
  - Services offered (packages)
  - Availability (shifts) with calendar
  - Event images/gallery
  - Customer reviews & ratings
  - Overall rating distribution
- **Actions Users Can Perform:**
  - View vendor details
  - Check availability by selecting date on calendar
  - View packages
  - View reviews & ratings
  - Click "Book Now" → Opens booking modal
  - Booking requires authentication (redirects to login if not logged in)
- **APIs Connected:**
  - GET `/Vendor/Getallvendors` - Fetch all vendors
  - GET `/Vendor/getAllVendorPackages?vendor_id=X` - Vendor packages
  - GET `/Vendor/GetVendorShifts?vendor_id=X` - Availability shifts
  - GET `/Vendor/GetvendorEventImages?vendor_id=X` - Gallery images
  - GET `/review/booking/:bookingId` - Reviews for vendor
- **Validation Rules:** None (view-only page)
- **State Managed:** Loading states, selected package, booking modal visibility
- **Reusable Components:** HomeNavbar, Footer, LoadingSpinner, Calendar

---

#### **3. VendorsByService (Route: `/vendors/:serviceId/:subServiceId` or `/vendors/:serviceId`)**
- **Purpose:** List all vendors for a specific service category
- **Route Parameters:**
  - `serviceId` (required) - Service category ID
  - `subServiceId` (optional) - Sub-service ID for more specific filtering
- **Location State:** Can receive `{ serviceName, serviceDescription, subServiceName, subServiceDescription }`
- **Components Used:**
  - HomeNavbar
  - Filter controls (date picker, filter type)
  - Vendor cards (name, image, rating)
  - Pagination
  - Footer
- **Data Displayed:**
  - Vendor list filtered by service
  - Vendor name, rating, image
  - Filter options (by category, by date availability)
- **Actions Available:**
  - Filter vendors by date
  - Toggle filter type (category vs. all)
  - Paginate through vendors
  - Click vendor → Navigate to VendorDetail
- **APIs Connected:**
  - GET `/Vendor/getvendorsBysubserviceId?subservice_id=X`
  - GET `/Vendor/getvendorsByServiceId?service_category_id=X`
- **Pagination:** 6 vendors per page
- **State Managed:** Selected date, filter type, current page, vendors list
- **Error Handling:** Shows "No vendors found" message if list is empty
- **Responsive:** Mobile-optimized card layout

---

#### **4. ServicesByCategory (Route: `/services-by-category/:categoryId`)**
- **Purpose:** Display services within a selected category
- **Route Parameters:** `categoryId` (numeric ID of category)
- **Data Displayed:** List of services/sub-services in category
- **APIs Used:** Service API to fetch by category
- **Actions:** Click service → Navigate to vendors for that service

---

#### **5. SubServicesPage (Route: `/sub-services/:categoryId`)**
- **Purpose:** Show sub-services within a category
- **Route Parameters:** `categoryId`
- **Data Displayed:** All sub-services for category
- **Actions:** Filter/search sub-services

---

#### **6. AllSubServicesPage (Route: `/services`)**
- **Purpose:** Global services directory
- **Data Displayed:** All services/sub-services system-wide
- **Search/Filter:** Search by name, filter by category
- **Pagination:** Paginate through services

---

#### **7. AllVendorsPage (Route: `/vendors`)**
- **Purpose:** Browse all vendors in system
- **Data Displayed:** All vendors with ratings, location
- **Filter Options:** Filter by service, by rating, by location
- **Search:** Search vendors by name
- **Pagination:** Page through vendors
- **Actions:** Click vendor → VendorDetail

---

#### **8. Category Pages (Routes: `/category/*`)**
Routes include:
- `/category/weddings` → Weddings.jsx
- `/category/corporate-events` → CorporateEvents.jsx
- `/category/concerts-festivals` → ConcertsFestivals.jsx
- `/category/birthday-parties` → BirthdayParties.jsx
- `/category/fashion-shows` → FashionShows.jsx
- `/category/exhibitions` → Exhibitions.jsx

**Purpose:** Pre-built landing pages for each event type

**Components:**
- Category-specific hero
- Services for that category
- Vendors for that category
- Related testimonials

**Reuse:** All use CategoryTemplate.jsx for common layout

---

#### **9. ReviewPage (Route: `/review/:bookingId`)**
- **Purpose:** Public review submission (via email link)
- **Route Parameters:** `bookingId`
- **Query Params:** `token` (review token for public access)
- **Authentication:** Public access (no login required if token provided)
- **Components Used:**
  - HomeNavbar
  - Review form (star rating, text review)
  - Booking details display
  - Footer
- **Data Displayed:**
  - Booking details (vendor name, service, date)
  - Review form fields
- **Form Fields:**
  - Overall rating (1-5 stars) - Required
  - Service quality rating - Optional
  - Communication rating - Optional
  - Value for money rating - Optional
  - Review text - Optional
- **Actions Available:**
  - Submit review
  - Confirm submission
- **Validation:**
  - Overall rating required
  - Rating must be 1-5
  - Review text optional but recommended
- **APIs Connected:**
  - GET `/Booking/review/:bookingId?token=X` - Fetch booking with token
  - GET `/Booking/GetBookingById/:bookingId` - Fetch booking (auth required)
  - POST `/Review/SubmitReview` - Submit review
- **Success Flow:** Show confirmation message → Redirect to home or bookings
- **Error Handling:** Show error if booking not found or not eligible for review

---

#### **10. About Page (Route: `/about`)**
- **Purpose:** Company information & mission
- **Components:** AboutSection, Footer
- **Static content** about GoEventify

---

#### **11. Contact Page (Route: `/contact`)**
- **Purpose:** Contact form for inquiries
- **Form Fields:**
  - Name - Required
  - Email - Required, must be valid
  - Subject - Required
  - Message - Required, min 10 characters
- **APIs:** POST contact form to backend
- **Success Message:** Confirmation email sent

---

#### **12. Why Us Page (Route: `/why-us`)**
- **Purpose:** Show unique selling propositions
- **Components:** WhyChooseUs section, testimonials, benefits list

---

#### **13. Auth Pages**

##### **Login Page (Route: `/login`)**
- **Purpose:** User authentication
- **Form Fields:**
  - Email - Required, valid email format
  - Password - Required, minimum 6 characters
  - Show/hide password toggle
  - "Remember me" checkbox (UI only, not implemented)
  - "Forgot password?" link
- **Validation:**
  - Email format validation (regex)
  - Password length (min 6 chars)
  - Real-time error display
- **APIs Connected:**
  - POST `/User/Login` with { email, password }
  - Response: { token, role, email, user_id, first_name, last_name }
- **Success Flow:**
  1. Token stored in localStorage
  2. User data stored in localStorage
  3. AuthContext updated via login()
  4. Redirect to role dashboard:
     - admin → `/admin/dashboard`
     - user → `/user/dashboard`
     - vendor → `/vendor/dashboard`
  5. Check for `redirect` query param and navigate there if present
- **Error Handling:**
  - Invalid credentials → "Invalid email or password"
  - Network error → Display error toast
- **UI Elements:**
  - Email input with icon
  - Password input with show/hide toggle
  - Login button (loading state while submitting)
  - Links to Register & Forgot Password
  - Branding/logo

---

##### **Register Page (Route: `/register`)**
- **Purpose:** New user registration
- **Form Fields:**
  - First name - Required
  - Last name - Required
  - Email - Required, unique, valid format
  - Phone - Optional but if provided must be 10 digits
  - Password - Required, min 6 chars, max 50 chars
  - User type toggle - "User" or "Vendor"
  - Terms & Conditions checkbox - Required
- **Validation:**
  - All required fields checked
  - Email format validated
  - Phone: 10-digit validation if provided
  - Password strength checked
  - T&C must be accepted
  - Real-time field validation
- **APIs Connected:**
  - POST `/User/InsertUser` with user data
  - Duplicate email check handled by backend
- **Success Flow:**
  1. User created in database
  2. Welcome email sent to new user
  3. Success toast shown
  4. Redirect to Login page after 800ms
- **Error Handling:**
  - Duplicate email → "Email already registered"
  - Validation errors shown inline
  - Network errors displayed
- **Vendor vs User:**
  - User type toggle determines user_type in registration
  - After registration, user must complete profile (vendor case)

---

##### **Forgot Password (Route: `/forgot-password`)**
- **Purpose:** Password reset initiation
- **Form Fields:**
  - Email - Required, must exist in system
- **APIs Connected:**
  - POST `/User/ForgotPassword` with email
  - Backend sends reset link via email
- **Success:** "Check your email for reset link"

---

##### **Reset Password (Route: `/reset-password`)**
- **Purpose:** Complete password reset
- **Query Params:** `token` (sent via email)
- **Form Fields:**
  - New password - Required, min 6 chars
  - Confirm password - Must match new password
- **APIs Connected:**
  - POST `/User/ResetPassword` with token + new password
- **Validation:**
  - Passwords match
  - Token still valid
- **Success:** "Password reset successful" → Redirect to login

---

### **PROTECTED PAGES (User Role)**

#### **User Dashboard (Route: `/user/dashboard`)**
- **Purpose:** User overview & KPIs
- **Authentication:** User role required
- **Components Used:**
  - MainLayout (with Navbar + Sidebar)
  - KPI cards (bookings count, total payment, saved vendors, support tickets)
  - Monthly chart (bookings & payments trend)
  - Quick action links (Book now, View bookings, Contact support)
- **Data Fetched:**
  - User KPIs: `GET /dashboard/user/kpis`
  - Monthly chart: `GET /dashboard/user/monthly`
- **Data Displayed:**
  - Welcome message with user name
  - Total bookings count
  - Total payments made (currency formatted)
  - Saved vendors count
  - Support tickets count
  - Monthly bookings & payment trend chart (bar chart using Recharts)
- **Actions Available:**
  - Navigate to "My Bookings" from sidebar
  - Click quick action buttons
  - View chart details
- **Loading State:** Spinner while fetching data
- **Error State:** Display error message if API fails
- **Responsive:** Chart adjusts width on mobile

---

#### **My Bookings (Route: `/user/bookings`)**
- **Purpose:** Manage user's bookings
- **Authentication:** User role required
- **Components Used:**
  - MainLayout
  - Filter tabs (all, pending, confirmed, completed, cancelled)
  - Booking cards with details
  - Modals (cancellation, review, OTP verification)
- **Data Displayed:**
  - Booking ID, booking date, event date
  - Vendor name, service, package
  - Booking location/address
  - Current status with badge color
  - Admin approval status
  - Booking amount/cost
- **Booking Statuses Displayed:**
  - **Pending Vendor Response** (yellow) - Vendor hasn't responded
  - **Awaiting Admin Approval** (blue) - Vendor accepted, awaiting admin
  - **Approved - OTP Required** (purple) - Admin approved, user must verify OTP
  - **OTP Verification In Progress** (orange) - OTP being verified
  - **Confirmed** (green) - Booking confirmed
  - **Awaiting Review** (teal) - Booking completed, awaiting review
  - **Completed** (gray) - Booking finished & reviewed
  - **Cancelled** (red) - Booking cancelled
- **Columns in Table/Card:**
  - Booking ID (clickable)
  - Vendor name
  - Service/package
  - Event date
  - Booking date
  - Amount
  - Status with badge
  - Actions (View details, Cancel, Review, OTP)
- **Actions Available:**
  - **View Details** - Expand booking full details
  - **Cancel Booking** - Opens cancellation modal with reason input
  - **Review** - Opens ReviewModal to submit review
  - **OTP Verify** - Opens OTPVerificationModal to enter OTP
  - **Resend OTP** - If OTP expired, resend to user
  - **Copy Booking ID** - Copy to clipboard
- **Modals:**
  - **Cancellation Modal:**
    - Reason textarea (optional)
    - Confirm & Cancel buttons
    - Shows cancellation rules (if any)
  - **Review Modal:** (See ReviewModal in Components section)
  - **OTP Modal:**
    - 6-digit OTP input
    - Resend OTP link
    - Attempt counter
- **Filters:**
  - All - All bookings
  - Pending - status: "pending", admin_approval: any
  - Confirmed - status: "confirmed"
  - Completed - status: "completed" or "awaiting_review"
  - Cancelled - Any cancelled status
- **Sorting:** By booking date (newest first)
- **Pagination:** Configurable (default 10 per page)
- **Search:** Search by booking ID, vendor name, or event address
- **APIs Connected:**
  - GET `/Booking/GetBookingsByUserId` - Fetch user's bookings
  - POST `/Booking/CancelBooking/:bookingId` - Cancel booking with reason
  - POST `/Booking/SubmitReview` - Submit review
  - POST `/OTP/VerifyOTP` - Verify OTP
  - POST `/OTP/ResendOTP/:bookingId` - Resend OTP
- **Loading State:** Skeleton loaders while fetching
- **Error State:** "Failed to load bookings" message
- **Empty State:** "No bookings found. Book a vendor now!"

---

### **PROTECTED PAGES (Vendor Role)**

#### **Vendor Dashboard (Route: `/vendor/dashboard`)**
- **Purpose:** Vendor business overview & KPIs
- **Authentication:** Vendor role required
- **Pre-Check:** Verifies vendor profile exists; if not, shows "Complete Profile" message
- **Components Used:**
  - MainLayout
  - KPI cards (total sales, new orders, active events, total clients)
  - Recent activities list
  - Subscription status banner
  - Quick action buttons
- **KPI Data Fetched:**
  - GET `/Vendor/GetVendorKPIs` - Returns { totalSales, newOrders, activeEvents, totalClients }
  - GET `/Vendor/GetVendorRecentActivities?limit=5` - Recent 5 activities
- **Activities Displayed:**
  - Recent bookings received
  - Profile views
  - Reviews received
  - Messages
  - Events booked
- **Subscription Status:**
  - Shows current subscription tier
  - Renewal date
  - Upgrade button if on basic plan
- **Actions Available:**
  - Navigate to Bookings
  - Navigate to Shifts
  - Navigate to Gallery
  - Navigate to Packages
  - Complete/Update Profile (if profile incomplete)
  - Upgrade subscription
- **Responsive:** KPI cards stack on mobile

---

#### **Vendor Profile Setup (Route: `/vendor/profile-setup`)**
- **Purpose:** Create/edit vendor business profile
- **Authentication:** Vendor role required
- **Components Used:**
  - Form with multiple sections
  - File upload for profile picture
  - Image preview
  - Service category dropdown
  - Multiple text inputs
- **Form Sections:**
  1. **Basic Info**
     - Business name - Required
     - Service category dropdown - Required
     - Years of experience - Optional
  2. **Contact**
     - Primary contact number - Required, 10 digits
     - Email - Optional (pre-filled from user)
  3. **Location**
     - Full address - Optional
     - City - Optional
     - State - Optional
  4. **Business Details**
     - Business description - Required
     - Website/social media URL - Optional
  5. **Media**
     - Profile picture upload - Required
     - Image preview shows current/selected image
- **Validation Rules:**
  - Business name: Required, 3-100 characters
  - Service category: Must select one
  - Contact: 10-digit Indian phone number format
  - Description: Required, minimum 20 characters
  - Profile picture: Required, JPEG/PNG, max 5MB
  - All required fields shown with asterisks
- **APIs Connected:**
  - GET `/Service/GetAllServices` - Fetch service categories
  - POST `/Vendor/UpdateVendorProfile` - Save/update profile
- **File Upload:**
  - FormData used for multipart file upload
  - Preview shown before upload
  - Progress indicator during upload
- **Success Flow:**
  1. Profile saved successfully
  2. Success toast shown
  3. Redirect to vendor dashboard
  4. Profile badge shows as "Complete"
- **Error Handling:**
  - Field-level validation errors shown inline
  - API errors displayed in toast
  - File upload errors (size, format) shown inline
- **UI Elements:**
  - Avatar upload area (click to upload or drag-drop)
  - MUI TextField components
  - MUI Select/MenuItem for categories
  - Save button (loading state while submitting)

---

#### **Vendor Bookings (Route: `/vendor/bookings`)**
- **Purpose:** Manage incoming booking requests
- **Authentication:** Vendor role required
- **Components Used:**
  - MainLayout
  - Filter tabs (all, pending, accepted, rejected, completed)
  - Booking cards with details
  - Modals (OTP verification, booking details)
- **Data Displayed:**
  - Booking ID, user name
  - Event date, booking date
  - Service/package booked
  - Event location
  - Booking amount
  - Status (pending vendor response, accepted pending admin, approved, completed)
  - User contact info (partially hidden for privacy)
- **Booking Statuses (Vendor View):**
  - **Pending Vendor Response** - Vendor needs to accept/reject
  - **Accepted - Awaiting Admin** - Vendor accepted, admin approving
  - **Approved** - Admin approved, OTP verification stage
  - **Completed** - Event completed
  - **Rejected by Vendor** - Vendor rejected
  - **Rejected by Admin** - Admin rejected
- **Actions Available:**
  - **Accept Booking** - Accept booking request
    - Confirmation dialog
    - Sets status to "accepted"
    - Notification sent to user
  - **Reject Booking** - Reject booking request
    - Opens modal for rejection reason
    - Reason text field
    - Notification sent to user with reason
  - **View Details** - Expand full booking details
  - **OTP Verification** - For approved bookings
    - Opens OTP modal
    - Vendor enters OTP to confirm event completion
    - Updates booking status to "completed"
  - **Cancel Booking** - For certain statuses
  - **Contact User** - Opens messaging interface
- **OTP Flow for Vendors:**
  - Admin sends OTP to vendor for approved bookings
  - Vendor must enter OTP to confirm event happened
  - OTP attempts limited (usually 3)
  - Upon successful OTP entry → Booking marked complete → User invited to review
- **Filters:**
  - Pending - status: "pending" and vendor hasn't responded
  - Accepted - status: "accepted" (approved by vendor, awaiting admin)
  - Completed - status: "completed"
  - Rejected - Any rejected status
  - All - All bookings
- **Sorting:** By booking date (newest first)
- **Pagination:** Configurable
- **Search:** By booking ID, user name, event address
- **APIs Connected:**
  - GET `/Booking/GetBookingsByVendorId` - Fetch vendor's bookings
  - POST `/Booking/AcceptBooking/:bookingId` - Accept booking
  - POST `/Booking/RejectBooking/:bookingId` - Reject with reason
  - POST `/OTP/VerifyOTP` - Verify OTP for completion
  - POST `/Booking/CancelBooking/:bookingId` - Cancel booking
- **Loading/Error States:** Spinner for fetching, error toasts
- **Empty State:** "No bookings yet. Share your profile to get bookings!"

---

#### **Vendor Shifts (Route: `/vendor/shifts`)**
- **Purpose:** Manage vendor availability schedule
- **Authentication:** Vendor role required
- **Components Used:**
  - MainLayout
  - Shift list table
  - Add/Edit shift modal
  - Delete confirmation dialog
- **Data Displayed:**
  - Shift name
  - Start time
  - End time
  - Days of week active (Mon, Tue, Wed, etc.)
  - Actions (Edit, Delete)
- **Form Fields (Add/Edit Modal):**
  - Shift name - Required (e.g., "Morning Shift", "Evening Shift")
  - Start time - Required (time picker, format HH:MM)
  - End time - Required (time picker, must be after start time)
  - Days of week - Required (checkboxes for each day)
    - Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- **Validation Rules:**
  - Shift name: 3-50 characters
  - Start time must be before end time
  - At least one day must be selected
  - Time format: HH:MM (24-hour)
- **Actions Available:**
  - **Add Shift** - Button opens modal for new shift
  - **Edit Shift** - Edit existing shift details
  - **Delete Shift** - Remove shift (confirmation dialog)
  - **Duplicate Shift** - Copy shift with different name
  - **Search Shifts** - Filter by shift name
  - **Sort** - By start time, end time, shift name
- **APIs Connected:**
  - GET `/ShiftAvailability/GetVendorShifts` - Fetch vendor's shifts
  - POST `/ShiftAvailability/CreateShift` - Create new shift
  - PUT `/ShiftAvailability/UpdateShift/:shiftId` - Update shift
  - DELETE `/ShiftAvailability/DeleteShift/:shiftId` - Delete shift
- **Time Parsing:** Backend stores times as HH:MM strings; frontend handles conversion
- **Days Storage:** Days stored as JSON array or comma-separated string in DB
- **UI Elements:**
  - MUI Table for list
  - Time input fields
  - Checkbox group for days
  - Modal dialog for add/edit
- **Responsive:** Stacked layout on mobile

---

#### **My Events (Route: `/vendor/myevents`)**
- **Purpose:** Track past/current events vendor has serviced
- **Components Used:**
  - MainLayout
  - Event cards with details
  - Filter by date/status
- **Data Displayed:**
  - Event name/type
  - Client name
  - Event date
  - Location
  - Packages used
  - Amount earned
  - Client rating/review
- **Actions:** View event details, view client feedback

---

#### **Vendor Gallery (Route: `/vendor/gallery`)**
- **Purpose:** Showcase event photos & portfolio
- **Components Used:**
  - MainLayout
  - Image upload area (drag-drop)
  - Image grid gallery
  - Delete image functionality
- **Features:**
  - Upload multiple images at once
  - Image preview before upload
  - Delete images
  - Organize/reorder images
  - Set featured image
- **APIs Connected:**
  - GET `/Vendor/GetvendorEventImages?vendor_id=X`
  - POST `/Vendor/UploadEventImages` - Upload images
  - DELETE `/Vendor/DeleteEventImage/:imageId` - Delete image

---

#### **My Packages (Route: `/vendor/mypackege`)**
- **Purpose:** Manage service packages vendor offers
- **Components Used:**
  - MainLayout
  - Package cards
  - Add/Edit package modal
- **Form Fields:**
  - Package name - Required
  - Description - Required
  - Price - Required, numeric
  - Validity period - Optional (days)
  - Package features/inclusions - Optional
  - Status (active/inactive) - Toggle
- **Actions:**
  - Add package
  - Edit package
  - Delete package
  - Toggle package active/inactive
- **APIs Connected:**
  - GET `/Vendor/getAllVendorPackages?vendor_id=X`
  - POST `/Vendor/CreatePackage` - Add package
  - PUT `/Vendor/UpdatePackage/:packageId` - Update
  - DELETE `/Vendor/DeletePackage/:packageId` - Delete

---

#### **Vendor Settings (Route: `/vendor/setting`)**
- **Purpose:** Configure vendor account preferences
- **Options:**
  - Change password
  - Update notification preferences
  - Set profile visibility
  - Manage payment information
  - Business hours
- **Components:** Form sections for each setting type

---

#### **Vendor Manual Reservations (Route: `/vendor/reservations`)**
- **Purpose:** Create manual bookings (vendor books for client directly)
- **Components:**
  - MainLayout
  - Manual booking form
  - Client details section
  - Date/time picker
  - Package selector
- **Use Case:** Vendor received booking call/email and wants to create booking in system
- **Form Fields:**
  - Client name - Required
  - Client email - Required
  - Client phone - Required
  - Event date - Required
  - Package - Required
  - Notes - Optional
- **APIs:** POST `/Booking/CreateManualBooking` (vendor authenticated)

---

### **PROTECTED PAGES (Admin Role)**

#### **Admin Dashboard (Route: `/admin/dashboard`)**
- **Purpose:** System overview & key metrics
- **Authentication:** Admin role required
- **Components Used:**
  - MainLayout
  - KPI cards (total users, total vendors, total bookings, total revenue, pending approvals, active bookings)
  - Activity timeline
  - Analytics cards (monthly bookings trend, status distribution, top vendors)
  - Charts (bar chart, pie chart, line chart)
- **KPI Data Fetched:**
  - GET `/admin/dashboard/kpis` - Returns {
      totalUsers, totalVendors, totalBookings, totalRevenue,
      pendingApprovals, activeBookings, monthlyGrowth
    }
  - GET `/admin/dashboard/activities?limit=5` - Recent admin activities
  - GET `/admin/dashboard/analytics` - Monthly bookings, status distribution, top vendors
- **Data Displayed:**
  - Total users count with growth %
  - Total bookings count with growth %
  - Total revenue (formatted in lakhs or millions)
  - Total vendors count with growth %
  - Pending approvals count (high priority)
  - Active bookings in progress
  - Monthly growth percentage
  - Recent activities list (user signups, bookings, vendor approvals)
  - Monthly bookings trend chart (line or bar)
  - Booking status distribution (pie chart - approved, pending, cancelled, completed)
  - Top vendors by bookings
- **Actions Available:**
  - Navigate to Users management
  - Navigate to Bookings approval
  - Navigate to Services management
  - View detailed analytics
- **Responsive:** KPI cards stack on mobile, charts adjust size

---

#### **Admin Users (Route: `/admin/users`)**
- **Purpose:** Manage all system users
- **Authentication:** Admin role required
- **Components Used:**
  - MainLayout
  - User table with pagination
  - Role filter tabs
  - User detail modal
  - Action menu (view details, edit, delete, block)
- **Data Displayed:**
  - User ID
  - First name + Last name
  - Email
  - Phone
  - User type/role (user, vendor, admin)
  - Registration date
  - Status (active, blocked, pending verification)
  - Avatar/profile picture
- **Columns:**
  - Avatar
  - Name
  - Email
  - Phone
  - Type
  - Status
  - Actions
- **Filters:**
  - By role (All, Users, Vendors, Admins)
  - By status (Active, Blocked, Pending)
  - Search by name, email, phone
- **Actions Available:**
  - **View Details** - Opens modal with full user info
    - Additional info: Address, city, state
    - Account creation date
    - Last login date
    - Total bookings (if user)
    - Services offered (if vendor)
  - **Edit** - Edit user details
    - Change name, email, phone
    - Update role (promote vendor to admin, etc.)
  - **Block/Unblock User** - Disable account
    - Prevents login
    - Reason for blocking shown
  - **Delete User** - Permanently remove user
    - Confirmation required
    - Cascade delete (bookings, reviews, etc.)
  - **Reset Password** - Send password reset email to user
  - **Verify Email** - Manually verify if needed
- **Pagination:** Default 5 per page
- **Sorting:** By name, email, registration date
- **Bulk Actions:** Select multiple users to bulk block/delete
- **APIs Connected:**
  - GET `/admin/users?role=X&status=Y` - Fetch paginated users
  - GET `/admin/users/:userId` - User details
  - PUT `/admin/users/:userId` - Update user
  - POST `/admin/users/:userId/block` - Block user
  - DELETE `/admin/users/:userId` - Delete user
  - POST `/admin/users/:userId/reset-password` - Send reset email
- **UI Elements:** MUI Table, Pagination, Dialog, Chips for status
- **Loading/Error States:** Spinner, error messages

---

#### **Admin Bookings (Route: `/admin/bookings`)**
- **Purpose:** Approve/reject all booking requests
- **Authentication:** Admin role required
- **Components Used:**
  - MainLayout
  - Bookings table with filters
  - Booking detail modal
  - Approval/rejection dialog
- **Data Displayed:**
  - Booking ID
  - User name
  - Vendor name
  - Service/package
  - Event date
  - Booking date
  - Amount
  - Status (pending approval, approved, rejected, completed, cancelled)
  - Admin approval status (pending, approved, rejected)
  - User contact info
  - Vendor contact info
- **Columns:**
  - Booking ID
  - User
  - Vendor
  - Service
  - Event Date
  - Amount
  - Status
  - Admin Status
  - Actions
- **Filters:**
  - By status (all, pending_approval, approved, completed, cancelled, rejected)
  - By admin approval (approved, rejected, pending)
  - Search by booking ID, user name, vendor name, event address
  - Date range filter (booking date range)
- **Booking Status Explanation:**
  - **Pending Approval**: Vendor accepted, awaiting admin review
  - **Approved**: Admin approved, OTP will be sent to user
  - **Rejected**: Admin rejected booking
  - **Completed**: Event happened & booking closed
  - **Cancelled**: Booking cancelled by user or vendor
- **Actions Available:**
  - **Approve Booking** - Admin accepts, OTP generated & sent to user
    - Opens approval dialog
    - Optional notes/comments
    - Confirmation required
    - Action logged for audit
  - **Reject Booking** - Admin rejects booking
    - Reason textarea (required)
    - Notification sent to user & vendor
  - **View Details** - Opens modal with full booking details
    - Booking timeline
    - User details
    - Vendor details
    - Service details
    - Event details
  - **Send OTP** - Manually send OTP if first send failed
  - **Manual Approval** - Override normal flow if needed
- **Timeline/Comments:** Show booking approval history
- **APIs Connected:**
  - GET `/bookings/admin/all-bookings` - Fetch all bookings
  - POST `/Booking/ApproveBooking/:bookingId` - Approve booking
  - POST `/Booking/RejectBooking/:bookingId` - Reject with reason
  - POST `/OTP/SendOTP/:bookingId` - Manually send OTP
- **Pagination:** Default 10 per page
- **Sorting:** By booking date, event date, status
- **Bulk Actions:** Select multiple bookings to bulk approve/reject
- **Responsive:** Horizontal scroll on mobile

---

#### **Add Services (Route: `/admin/addservices`)**
- **Purpose:** Create/manage main service categories
- **Authentication:** Admin role required
- **Components Used:**
  - MainLayout
  - Service list with search
  - Add/Edit service modal
  - File upload for service icon
- **Form Fields:**
  - Category name - Required, unique
  - Description - Required
  - Service icon - Required, image upload
  - Is active - Toggle
- **Validation Rules:**
  - Category name: 3-50 characters, unique
  - Description: 10-500 characters
  - Icon: JPEG/PNG, max 2MB
- **Data Displayed:**
  - Service name
  - Description preview
  - Icon image
  - Status (active/inactive)
  - Number of sub-services
  - Number of vendors offering it
  - Creation date
- **Actions Available:**
  - **Add Service** - Opens modal for new service
  - **Edit Service** - Update service details
  - **Delete Service** - Remove service (with confirmation)
  - **Toggle Active/Inactive** - Deactivate service
  - **View Sub-Services** - Navigate to sub-services for this service
  - **Search Services** - Filter by name
  - **Sort** - By name, creation date, active status
- **File Upload:**
  - Click to upload or drag-drop
  - Image preview before save
  - Existing image shown if editing
- **APIs Connected:**
  - GET `/Service/GetAllServices` - Fetch all services
  - POST `/Service/InsertService` - Create service
  - PUT `/Service/UpdateService/:serviceId` - Update service
  - DELETE `/Service/DeleteService/:serviceId` - Delete service
- **Responsive:** Form stacked on mobile

---

#### **Main Service (Route: `/admin/mainservice`)**
- **Purpose:** Manage sub-services within main categories
- **Similar to Add Services but for sub-services**
- **Additional fields:**
  - Parent service category - Dropdown select
  - Sub-service specific features
- **Actions:**
  - Create sub-service under main service
  - Edit sub-service details
  - Delete sub-service
  - Link/unlink vendors
- **APIs:** Equivalent to main service APIs but for sub-services

---

#### **Admin Manual Reservations (Route: `/admin/reservations`)**
- **Purpose:** Admin can create bookings directly for clients
- **Use Case:** Customer called support, admin creates booking in system
- **Form Fields:**
  - Select client (existing user) or create new
  - Select vendor
  - Select service/package
  - Event date & time
  - Location/notes
- **APIs:** POST `/Booking/AdminCreateManualBooking`

---

#### **Admin Subscriptions (Route: `/admin/subscriptions`)**
- **Purpose:** Manage vendor subscription tiers
- **Data Displayed:**
  - Subscription tiers (basic, standard, premium)
  - Price for each tier
  - Features included
  - Vendors on each tier
  - Renewal dates
  - Payment status
- **Actions:**
  - Create subscription tier
  - Edit tier details/pricing
  - View vendors on tier
  - Manual renewal for vendor
  - Pause/activate subscriptions

---

---

## Navigation Structure

### **Sidebar Menu Configuration (menuConfig)**

```javascript
// For Admin
admin: [
  { Dashboard, Services, Main Services, Bookings, Manual Reservations }
]

// For Vendor
vendor: [
  { Dashboard, Shifts, Bookings, Manual Reservations, Events, Gallery, Package, Settings }
]

// For User
user: [
  { Dashboard, My Bookings }
]

// For Marketer (placeholder)
marketer: [
  { Campaigns, Leads }
]
```

### **Navigation Flow Diagram**

```
Home Page
├── Browse Services
│   ├── Service Categories
│   │   ├── Weddings
│   │   ├── Corporate Events
│   │   ├── Concerts & Festivals
│   │   ├── Birthday Parties
│   │   ├── Fashion Shows
│   │   └── Exhibitions
│   └── View Vendors by Service
│       └── Vendor Detail → Book Now
│
├── All Services Directory
│   └── Browse Sub-services
│
├── All Vendors Directory
│   └── View Vendor Profile
│
├── Static Pages (About, Contact, Why Us)
│
└── Auth (Login/Register)
    │
    ├── → User Dashboard
    │   ├── Dashboard (KPIs)
    │   └── My Bookings
    │
    ├── → Vendor Dashboard
    │   ├── Dashboard (KPIs)
    │   ├── Profile Setup
    │   ├── Bookings
    │   ├── Shifts
    │   ├── Gallery
    │   ├── Packages
    │   ├── Events
    │   └── Settings
    │
    └── → Admin Dashboard
        ├── Dashboard (Analytics)
        ├── Users Management
        ├── Bookings Approval
        ├── Services Management
        └── Subscriptions
```

### **Header/Navbar Structure**

**Public Pages Navbar:**
- Logo (clickable → home)
- Navigation links (Home, Services, About, Contact, Why Us)
- Right side: Login, Register buttons
- Mobile: Hamburger menu for links

**Protected Pages Navbar (MainLayout):**
- Left: Menu toggle button (mobile only)
- Center: Logo
- Right side:
  - Search bar (if applicable)
  - Notifications bell (red badge for unread count)
  - User profile dropdown
    - User name
    - View profile
    - Settings
    - Change password
    - Logout
  - Mobile: Collapsed into 3-dot menu

### **Breadcrumb Flow**

**Example paths:**
- Home > Services > Weddings > View Vendors > Vendor Detail
- Home > All Services > Sub-service > Select Vendor > Book
- Dashboard > My Bookings > Booking Details

---

## Component Documentation

### **Shared/Reusable Components**

#### **LoadingSpinner.jsx**
- **Purpose:** Show loading indicator
- **Props:**
  - `message` - Optional loading message
  - `fullScreen` - Boolean, center on full screen or inline
- **Usage:** While fetching data
```jsx
<LoadingSpinner message="Loading data..." fullScreen />
```

---

#### **ErrorBoundary.jsx**
- **Purpose:** Catch React component errors and display fallback UI
- **Props:**
  - `children` - Components to wrap
- **Usage:** Wrap page or section
```jsx
<ErrorBoundary>
  <SomePage />
</ErrorBoundary>
```

---

#### **ScrollToTop.jsx**
- **Purpose:** Auto-scroll to top when route changes
- **Usage:** Include in App.jsx (no props needed)

---

#### **NotificationBell.jsx**
- **Purpose:** Show notification icon + dropdown list
- **Props:**
  - `notifications` - Array of notification objects
  - `onRead` - Callback when user opens notification
- **Features:**
  - Badge shows unread count
  - Dropdown on click
  - Mark as read
  - Link to full notifications page
- **Usage:**
```jsx
<NotificationBell notifications={unreadNotifications} />
```

---

#### **ReviewModal.jsx**
- **Purpose:** Submit review for completed booking
- **Props:**
  - `booking` - Booking object with details
  - `onClose` - Close modal callback
  - `onSuccess` - Success callback
- **Form Fields:**
  - Overall rating (1-5 stars) - Required
  - Service quality rating (1-5) - Optional
  - Communication rating (1-5) - Optional
  - Value for money rating (1-5) - Optional
  - Punctuality rating (1-5) - Optional
  - Review text - Optional textarea
- **Validation:** Rating required, 1-5 range
- **Usage:**
```jsx
{showReviewModal && (
  <ReviewModal 
    booking={selectedBooking}
    onClose={() => setShowReviewModal(false)}
    onSuccess={refreshBookings}
  />
)}
```

---

#### **OTPVerificationModal.jsx**
- **Purpose:** Enter OTP for booking confirmation
- **Props:**
  - `open` - Boolean, modal visibility
  - `onClose` - Close callback
  - `onVerify` - Verify OTP callback
  - `bookingId` - Booking ID
  - `attemptLimit` - Max OTP attempts
- **Form Fields:**
  - 6-digit OTP input (numeric only)
  - Resend OTP link
- **Features:**
  - Attempt counter
  - Disable after max attempts
  - Resend OTP functionality
- **Usage:**
```jsx
<OTPVerificationModal
  open={otpModalOpen}
  bookingId={booking.id}
  onVerify={handleOTPVerify}
  onClose={handleModalClose}
/>
```

---

#### **TermsAndConditionsModal.jsx**
- **Purpose:** Display T&C for acceptance
- **Usage:** In register form

---

#### **SubscriptionPayment.jsx**
- **Purpose:** Handle payment for subscriptions
- **Props:**
  - `plan` - Subscription plan details
  - `onSuccess` - Payment success callback
- **Features:**
  - Plan details display
  - Payment method selection
  - Amount display
  - Loading state while processing

---

#### **SubscriptionStatus.jsx**
- **Purpose:** Show current subscription status
- **Props:**
  - `vendorId` - Vendor ID
- **Displays:**
  - Current tier (basic, standard, premium)
  - Renewal date
  - Upgrade button
  - Features included

---

#### **BookingStatusFlow.jsx**
- **Purpose:** Visual timeline of booking status progression
- **Props:**
  - `bookingId` - Booking to show timeline for
  - `status` - Current status
- **Displays:**
  - Status timeline (Pending → Vendor → Admin → OTP → Confirmed → Completed)
  - Current step highlighted
  - Timestamps for each step (if available)

---

#### **ChangePassword.jsx**
- **Purpose:** Change account password
- **Route:** `/changepassword`
- **Form Fields:**
  - Current password - Required
  - New password - Required, min 6 chars
  - Confirm new password - Required, must match
- **Validation:**
  - Current password correct
  - New password different from current
  - Passwords match
  - Password strength check
- **APIs:** POST `/User/ChangePassword`

---

#### **StateComponents.jsx**
- **Purpose:** Reusable state display components
- **Exports:**
  - `LoadingSpinner` - Loading state
  - `NoDataFound` - Empty state
  - `ErrorDisplay` - Error state
  - `CardSkeleton` - Skeleton loader
- **Usage:**
```jsx
import { LoadingSpinner, NoDataFound, ErrorDisplay } from '../components/common/StateComponents'

{isLoading && <LoadingSpinner />}
{isEmpty && <NoDataFound message="No data found" />}
{isError && <ErrorDisplay error={error} />}
```

---

#### **Layout Components**

##### **MainLayout.jsx**
- **Purpose:** Main layout for protected pages
- **Components:** Navbar + Sidebar + Outlet
- **Features:**
  - Responsive (sidebar hidden on mobile)
  - Sidebar toggle on mobile
  - Main content area

##### **Navbar.jsx**
- **Purpose:** Top navigation for dashboard
- **Features:**
  - User profile dropdown
  - Notifications bell
  - Logo (clickable)
  - Menu toggle (mobile)
  - Logout button

##### **Sidebar.jsx**
- **Purpose:** Left sidebar navigation
- **Features:**
  - Role-based menu items from `menuConfig`
  - Active route highlighting
  - Mobile drawer version
  - Scrollable menu list

---

#### **Landing Page Components**

All located in `components/mainpage/`:

- **HomeNavbar.jsx** - Landing page navbar with nav links
- **HeroSection.jsx** - Rotating hero carousel with CTAs
- **ServiceSection.jsx** - Grid of main service categories
- **SubServicesSection.jsx** - Featured sub-services showcase
- **ShowcaseSection.jsx** - Featured vendors carousel
- **Testimonials.jsx** - Customer reviews/testimonials
- **WhyChooseUs.jsx** - USP/benefits section
- **AboutSection.jsx** - About company info
- **CTASection.jsx** - Call-to-action buttons section
- **Footer.jsx** - Footer with links & info
- **FAQSection.jsx** - FAQ accordion
- **ContactPopup.jsx** - Contact form modal
- **BookingSection.jsx** - Booking CTA
- **Vendorsection.jsx** - Featured vendors display
- **EventStackShowcase.jsx** - Example events display
- **TiltedCard.jsx** - Animated card component
- **HexCollage.jsx** - Hexagon image layout
- **CircularGallery.jsx** - Circular image gallery
- **SocialSidebar.jsx** - Social media links sidebar

---

## Forms Documentation

### **1. Login Form** (`pages/Auth/Login.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Email | text input | Email format (regex) | Yes | Shows icon |
| Password | password input | Min 6 chars | Yes | Show/hide toggle |

**Submission:**
- POST `/User/Login` with { email, password }
- On success: Store token + user → Redirect to dashboard
- On error: Show error toast

---

### **2. Registration Form** (`pages/Auth/Register.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| First Name | text input | 1-50 chars | Yes | |
| Last Name | text input | 1-50 chars | Yes | |
| Email | email input | Valid format, unique | Yes | |
| Phone | tel input | 10 digits (6-9 start) | No | Indian format |
| Password | password | Min 6, max 50 chars | Yes | Show/hide |
| Confirm Password | password | Must match password | Yes | |
| User Type | radio/select | "user" or "vendor" | Yes | Toggle button |
| Terms & Conditions | checkbox | Must accept | Yes | Links to T&C modal |

**Submission:**
- POST `/User/InsertUser` with form data
- Duplicate email check
- On success: Redirect to login after 800ms
- Vendor must complete profile after registration

---

### **3. Vendor Profile Setup Form** (`pages/Dashboards/Vendor/VendorProfileSetup.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Business Name | text | 3-100 chars | Yes | |
| Service Category | select/dropdown | Select one category | Yes | From API |
| Years Experience | number | 0-60 | No | |
| Contact Number | tel | 10 digits, Indian format | Yes | |
| Email | email | Read-only pre-filled | No | User email |
| Business Description | textarea | 20-1000 chars | Yes | |
| Website URL | url | Valid URL format | No | Optional |
| Full Address | textarea | | No | |
| City | text | | No | |
| State | text | | No | |
| Profile Picture | file | JPEG/PNG, max 5MB | Yes | Upload or drag-drop |

**Submission:**
- POST `/Vendor/UpdateVendorProfile` with FormData
- Image uploaded separately
- On success: Redirect to vendor dashboard
- Profile status marked complete

---

### **4. Vendor Shift Form** (Modal in `VendorShiftPage.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Shift Name | text | 3-50 chars | Yes | e.g., "Morning", "Evening" |
| Start Time | time picker | HH:MM format | Yes | 24-hour format |
| End Time | time picker | After start time | Yes | 24-hour format |
| Days of Week | checkboxes | At least 1 day | Yes | Mon-Sun selection |

**Submission:**
- POST `/ShiftAvailability/CreateShift` for new
- PUT `/ShiftAvailability/UpdateShift/:shiftId` for edit
- Success: Shift added/updated, list refreshed

---

### **5. Vendor Booking Cancellation Modal**

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Reason | textarea | 10-500 chars | No | Optional reason |

**Submission:**
- POST `/Booking/CancelBooking/:bookingId` with reason
- Notification sent to vendor
- Booking status updated to "cancelled_by_user"

---

### **6. Vendor Booking Rejection Modal** (`VendorBookings.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Reason | textarea | 10-300 chars | Yes | Why rejecting? |

**Submission:**
- POST `/Booking/RejectBooking/:bookingId` with reason
- Notification sent to user
- Booking status: "rejected_by_vendor"

---

### **7. Review Form** (`ReviewModal.jsx` or `ReviewPage.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Overall Rating | star rating (1-5) | 1-5, numeric | Yes | Required to submit |
| Service Quality | star rating (1-5) | 1-5 | No | Optional detailed rating |
| Communication | star rating (1-5) | 1-5 | No | How responsive was vendor? |
| Value for Money | star rating (1-5) | 1-5 | No | Was price fair? |
| Punctuality | star rating (1-5) | 1-5 | No | Was vendor on time? |
| Review Text | textarea | 10-1000 chars | No | Optional written review |

**Submission:**
- POST `/Review/SubmitReview` with ratings + text
- Success: Booking status → "completed", user redirected
- Review becomes public on vendor profile

---

### **8. Contact Form** (`ContactPage.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Name | text | 2-100 chars | Yes | |
| Email | email | Valid format | Yes | |
| Subject | text | 5-100 chars | Yes | |
| Message | textarea | 10-1000 chars | Yes | |

**Submission:**
- POST `/Contact/SubmitContactForm`
- Confirmation email sent
- Success: "Thank you, we'll contact you soon"

---

### **9. Manual Booking Form** (`VendorManualReservations.jsx`)

| Field | Type | Validation | Required | Notes |
|-------|------|-----------|----------|-------|
| Client Name | text | | Yes | |
| Client Email | email | Valid format | Yes | |
| Client Phone | tel | 10 digits | Yes | |
| Event Date | date picker | Future date | Yes | |
| Event Time | time picker | | Yes | |
| Service/Package | select | Select available | Yes | |
| Location | textarea | | No | |
| Special Notes | textarea | | No | |

**Submission:**
- POST `/Booking/CreateManualBooking` (vendor)
- Creates booking skipping user creation
- Notification sent to admin for approval

---

---

## Tables & Data Views

### **1. User Bookings Table** (`MyBookings.jsx`)

**Columns:**
| Column | Type | Sortable | Filterable | Actions |
|--------|------|----------|-----------|---------|
| Booking ID | text | Yes | Yes (search) | Copy to clipboard |
| Vendor | text | Yes | Yes | View vendor profile |
| Service | text | Yes | Yes | |
| Event Date | date | Yes | Yes | Date range filter |
| Booking Date | date | Yes | Yes | |
| Amount | currency | Yes | Yes | |
| Status | badge | Yes | Yes (filter tabs) | Status legend |
| Actions | buttons | No | No | Cancel, Review, OTP |

**Filters:**
- Status tabs (all, pending, confirmed, completed, cancelled)
- Search by booking ID, vendor name, event address
- Date range picker (booking date or event date)

**Sorting:** By booking date (default: newest first)

**Pagination:** 10 rows per page, configurable

**Expandable Rows:** Show full booking details

**Export:** Optional CSV export

---

### **2. Vendor Bookings Table** (`VendorBookings.jsx`)

**Columns:**
| Column | Type | Sortable | Filterable | Actions |
|--------|------|----------|-----------|---------|
| Booking ID | text | Yes | Yes | Copy |
| User | text | Yes | Yes | |
| Service | text | Yes | Yes | |
| Event Date | date | Yes | Yes | |
| Booking Date | date | Yes | Yes | |
| Amount | currency | Yes | Yes | |
| Status | badge | Yes | Yes (tabs) | |
| Admin Status | badge | No | No | |
| Actions | buttons | No | No | Accept, Reject, OTP, Details |

**Filters:**
- Status tabs
- Search by booking ID, user name, event address

---

### **3. Admin Bookings Table** (`AdminBookings.jsx`)

**Columns:**
| Column | Type | Sortable | Filterable | Actions |
|--------|------|----------|-----------|---------|
| Booking ID | text | Yes | Yes | View |
| User | text | Yes | Yes | View details |
| Vendor | text | Yes | Yes | View profile |
| Service | text | Yes | Yes | |
| Event Date | date | Yes | Yes | |
| Amount | currency | Yes | Yes | |
| Status | badge | Yes | Yes (tabs) | |
| Admin Status | badge | Yes | Yes | |
| Actions | buttons | No | No | Approve, Reject, Send OTP, Details |

**Filters:**
- Status filter (all, pending_approval, approved, completed, cancelled, rejected)
- Admin approval status
- Search by booking ID, user name, vendor name, event address
- Date range (booking date or event date)

**Bulk Actions:** Select multiple → Bulk approve/reject

---

### **4. Users Management Table** (`AdminUsers.jsx`)

**Columns:**
| Column | Type | Sortable | Filterable | Actions |
|--------|------|----------|-----------|---------|
| Avatar | image | No | No | |
| Name | text | Yes | Yes | |
| Email | text | Yes | Yes (search) | Copy |
| Phone | text | Yes | Yes | Call link |
| Type | badge | Yes | Yes (tabs) | |
| Status | badge | Yes | Yes | |
| Joined Date | date | Yes | Yes | |
| Actions | buttons | No | No | View, Edit, Block, Delete |

**Filters:**
- Role tabs (All, Users, Vendors, Admins)
- Status filter (Active, Blocked, Pending)
- Search by name, email, phone

**Pagination:** 5 rows per page

---

### **5. Admin Services Table** (`AddServices.jsx`)

**Columns:**
| Column | Type | Sortable | Filterable | Actions |
|--------|------|----------|-----------|---------|
| Icon | image | No | No | |
| Name | text | Yes | Yes | |
| Description | text | No | Yes (search) | Preview |
| Sub-Services Count | number | Yes | Yes | |
| Active | toggle | No | No | Toggle active/inactive |
| Actions | buttons | No | No | Edit, Delete, View sub-services |

**Search:** By service name

---

### **6. Vendor Shifts Table** (`VendorShiftPage.jsx`)

**Columns:**
| Column | Type | Sortable | Filterable | Actions |
|--------|------|----------|-----------|---------|
| Name | text | Yes | Yes | |
| Start Time | time | Yes | No | |
| End Time | time | Yes | No | |
| Days | text | No | No | Show as badges |
| Actions | buttons | No | No | Edit, Delete, Duplicate |

**Search:** By shift name

---

---

## Dashboard & Analytics Sections

### **User Dashboard KPIs**

**Widgets:**
1. **Total Bookings** - Card showing count + link to My Bookings
2. **Total Payment** - Currency display (formatted in rupees)
3. **Saved Vendors** - Favorite vendors count
4. **Support Tickets** - Open support tickets count

**Chart:**
- **Monthly Trend Chart** (Bar chart using Recharts)
  - X-axis: Last 12 months
  - Y-axis: Bookings count + Payments amount
  - Two data series (bookings as bars, payments as line)
  - Interactive tooltips

**Recent Activities:**
- Last 5 bookings
- Quick action links

---

### **Vendor Dashboard KPIs**

**Widgets:**
1. **Total Sales** - Revenue earned (currency formatted)
2. **New Orders** - New booking requests (high priority)
3. **Active Events** - Events in progress
4. **Total Clients** - Unique clients served

**Subscription Status Banner:**
- Current tier display
- Renewal date
- Upgrade link if available

**Recent Activities:**
- Recent bookings received
- Profile views
- Reviews received
- Events booked

**Quick Actions:**
- View bookings
- Add shift
- Upload gallery images
- Update packages

---

### **Admin Dashboard KPIs**

**Widgets:**
1. **Total Users** - All users in system + growth %
2. **Total Vendors** - All vendors + growth %
3. **Total Bookings** - All bookings count + growth %
4. **Total Revenue** - Total money earned (formatted)
5. **Pending Approvals** - Bookings awaiting admin approval (high priority)
6. **Active Bookings** - Bookings in progress

**Charts:**
1. **Monthly Bookings Trend** - Line or bar chart
   - Shows booking volume over last 12 months
   - Trend indicator (up/down)

2. **Status Distribution** - Pie chart
   - Segments: Approved, Pending, Rejected, Completed, Cancelled
   - Percentage for each

3. **Top Vendors** - Horizontal bar chart
   - Top 5 vendors by number of bookings
   - Shows vendor name + booking count

**Recent Activities Timeline:**
- User signups
- Vendor registrations
- Booking approvals
- System actions
- Timestamps

**Quick Navigation:**
- Link to Users management
- Link to Bookings approval
- Link to Services management
- Link to Subscriptions

---

---

## Role-Based Access Control

### **Role Definitions**

**1. User (Event Organizer)**
- Can browse and search services/vendors
- Can book vendors
- Can manage their bookings
- Can submit reviews
- Can view notifications
- Cannot access admin or vendor features

**Accessible Routes:**
- All public routes
- `/user/dashboard`
- `/user/bookings`
- `/notifications`

---

**2. Vendor (Service Provider)**
- Can create/update business profile
- Can manage availability shifts
- Can accept/reject booking requests
- Can manage event gallery and packages
- Can view their bookings and revenue
- Cannot access user services or admin
- Must complete profile before accessing dashboard

**Accessible Routes:**
- `/vendor/dashboard`
- `/vendor/profile-setup`
- `/vendor/bookings`
- `/vendor/shifts`
- `/vendor/gallery`
- `/vendor/mypackege`
- `/vendor/myevents`
- `/vendor/setting`
- `/vendor/reservations` (manual bookings)
- `/notifications`

---

**3. Admin (System Manager)**
- Can manage all users (view, edit, block, delete)
- Can manage all vendors (approve, suspend)
- Can approve/reject bookings
- Can create service categories
- Can manage subscriptions
- Can view system analytics
- Cannot place bookings as user

**Accessible Routes:**
- `/admin/dashboard`
- `/admin/users`
- `/admin/bookings`
- `/admin/addservices`
- `/admin/mainservice`
- `/admin/subscriptions`
- `/admin/reservations`

---

**4. Marketer (Future Role)**
- Can create marketing campaigns
- Can track leads
- Can view analytics

---

### **Permission Matrix**

| Feature | User | Vendor | Admin |
|---------|------|--------|-------|
| Browse services | ✅ | ✅ | ✅ |
| Book vendors | ✅ | ❌ | ❌ |
| Manage bookings | ✅ (own) | ✅ (own) | ✅ (all) |
| Submit reviews | ✅ | ❌ | ❌ |
| Manage profile | ✅ | ✅ | ❌ |
| Manage availability | ❌ | ✅ | ❌ |
| View user management | ❌ | ❌ | ✅ |
| Approve bookings | ❌ | ❌ | ✅ |
| Manage services | ❌ | ❌ | ✅ |
| View analytics | ❌ | ✅ | ✅ |
| Send notifications | ❌ | ❌ | ✅ |

---

### **Route Protection Implementation**

**Protected Route Wrapper:**
```javascript
// ProtectedRoute checks:
1. User authenticated? (token in localStorage)
2. Token valid/not expired?
3. User has required role?

If any check fails → Redirect to /login
If role not allowed → Redirect to role dashboard
```

**Route Pattern:**
```jsx
<ProtectedRoute allowedRoles={["admin"]}>
  <Route path="/admin/*" element={<AdminDashboard />} />
</ProtectedRoute>
```

---

---

## State Management & Architecture

### **Global State (Context API)**

#### **AuthContext** (`context/AuthContext.jsx`)

**State:**
```javascript
{
  user: {
    role: "user|vendor|admin",
    email: string,
    user_id: number,
    first_name: string,
    last_name: string
  },
  loading: boolean,  // true during app init
  logout: function,
  login: function,
  refreshSession: function
}
```

**Key Methods:**
- `login(data)` - Store user + token
- `logout()` - Clear auth data
- `refreshSession()` - Validate token with backend

**Consumption:**
- Used by `ProtectedRoute` for authorization
- Used by `Navbar` for user info display
- Used by `useAuth` hook in components
- Used by all API services for authenticated requests

**Persistence:**
- Token stored in `localStorage`
- User data stored in `localStorage`
- Restored on app load

---

#### **ThemeContext** (`context/ThemeContext.jsx`)

**State:**
```javascript
{
  theme: "light|dark",
  toggleTheme: function
}
```

**Usage:** Light/dark mode toggle

---

### **Local Component State**

**Common patterns:**
```javascript
// Form data
const [formData, setFormData] = useState({...})

// Loading & error states
const [loading, setLoading] = useState(false)
const [error, setError] = useState(null)

// UI states
const [modalOpen, setModalOpen] = useState(false)
const [filter, setFilter] = useState("all")
const [page, setPage] = useState(1)

// Data
const [items, setItems] = useState([])
```

---

### **Custom Hooks**

#### **useAuth.js**
```javascript
const { isAuthenticated, isLoading, user } = useAuth(requiredRole, shouldRedirect)
// Check authentication status & role
```

#### **useAuthRedirect.js**
```javascript
const { requireAuth } = useAuthRedirect()
// Redirect to login if not authenticated before action
// Usage: In "Book Now" buttons on public pages
```

#### **useApiCall.js**
```javascript
const { data, loading, error, execute } = useApiCall(initialData)
// Wrapper for API calls with loading/error handling
// Usage: In VendorsByService for fetching vendors
```

#### **usePageTracking.js**
```javascript
usePageTracking()
// Track page views for analytics
// Usage: In App.jsx
```

#### **usePWAInstall.js**
```javascript
const { isInstallable, installApp } = usePWAInstall()
// PWA installation prompt
// Usage: In HomePage
```

---

### **API Service Layer Architecture**

**Pattern:** Services export methods that use axios configured instance

**Services:**
- `bookingService` - Booking CRUD + management
- `vendorService` - Vendor profile & KPIs
- `adminService` - Admin operations
- `dashboardService` - Dashboard data
- `otpService` - OTP verification
- `reviewService` - Review submission
- `notificationService` - Notification management
- `subscriptionService` - Subscription management
- `shiftAvailabilityService` - Vendor shifts

**Example:**
```javascript
// bookingService.js
const bookingService = {
  createBooking: async (data) => {
    return api.post("/Booking/InsertBooking", data)
  },
  getUserBookings: async () => {
    return api.get("/Booking/GetBookingsByUserId")
  }
}
```

**Error Handling:**
- Axios interceptors in `axiosConfig.js`
- Catch errors and display toast notifications
- Token validation on 401 responses

---

### **Axios Configuration** (`services/axiosConfig.js`)

```javascript
// Base URL from environment
axios.defaults.baseURL = VITE_API_BASE_URL

// Auto-include credentials (cookies)
axios.defaults.withCredentials = true

// Request interceptor: Add token to headers
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor: Handle errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Token expired, logout user
      localStorage.clear()
      window.location.href = "/login"
    }
    return Promise.reject(error)
  }
)
```

---

---

## API Mapping

### **User Authentication APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/User/Login` | POST | { email, password } | { token, role, email, user_id, first_name, last_name } | Login page |
| `/User/InsertUser` | POST | { first_name, last_name, email, phone, password, user_type } | { user_id, success } | Register page |
| `/User/ForgotPassword` | POST | { email } | { message, success } | Forgot Password page |
| `/User/ResetPassword` | POST | { token, password } | { message, success } | Reset Password page |
| `/User/Logout` | POST | {} | { success } | Logout action |
| `/User/validate-token` | POST | {} | { valid, user } | Auth refresh |
| `/User/ChangePassword` | POST | { old_password, new_password } | { success, message } | Change Password page |

---

### **User Dashboard APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/dashboard/user/kpis` | GET | - | { bookings, totalPayment, savedVendors, tickets } | User Dashboard |
| `/dashboard/user/monthly` | GET | - | { data: [{ month, bookings, payments }] } | User Dashboard chart |

---

### **Booking APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/Booking/InsertBooking` | POST | { vendor_id, service_id, event_date, time, package_id, address } | { booking_id, status } | VendorDetail booking |
| `/Booking/GetBookingsByUserId` | GET | - | { bookings: [{ booking_id, vendor_id, status... }] } | My Bookings |
| `/Booking/GetBookingsByVendorId` | GET | - | { bookings: [...] } | Vendor Bookings |
| `/bookings/admin/all-bookings` | GET | - | { bookings: [...], pagination } | Admin Bookings |
| `/Booking/GetBookingById/:bookingId` | GET | - | { success, data: { booking details } } | Review page auth |
| `/Booking/CancelBooking/:bookingId` | POST | { reason } | { success } | My Bookings cancel |
| `/Booking/AcceptBooking/:bookingId` | POST | - | { success } | Vendor Bookings accept |
| `/Booking/RejectBooking/:bookingId` | POST | { reason } | { success } | Vendor Bookings reject |
| `/Booking/ApproveBooking/:bookingId` | POST | - | { success, otp_sent } | Admin Bookings approve |
| `/Booking/review/:bookingId` | GET | ?token=X | { success, data: { booking } } | Public review link |

---

### **Vendor APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/Vendor/Getallvendors` | GET | - | { vendors: [...] } | All vendors list, Vendor detail |
| `/Vendor/getvendorsByServiceId` | GET | ?service_category_id=X | { vendors: [...] } | VendorsByService |
| `/Vendor/getvendorsBysubserviceId` | GET | ?subservice_id=X | { vendors: [...] } | VendorsByService |
| `/Vendor/GetVendorProfile` | GET | - | { vendor data } | Vendor dashboard check |
| `/Vendor/UpdateVendorProfile` | POST | FormData { business_name, service_category_id, description, contact, address... profilePicture } | { success } | Vendor profile setup |
| `/Vendor/GetVendorKPIs` | GET | - | { kpis: { totalSales, newOrders, activeEvents, totalClients } } | Vendor dashboard |
| `/Vendor/GetVendorRecentActivities` | GET | ?limit=5 | { activities: [...] } | Vendor dashboard |
| `/Vendor/GetVendorShifts` | GET | ?vendor_id=X | { shifts: [...] } | VendorDetail calendar, Vendor shifts page |
| `/Vendor/getAllVendorPackages` | GET | ?vendor_id=X | { packages: [...] } | VendorDetail packages |
| `/Vendor/GetvendorEventImages` | GET | ?vendor_id=X | { eventImages: [...] } | VendorDetail gallery |

---

### **Admin APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/admin/dashboard/kpis` | GET | - | { totalUsers, totalVendors, totalBookings, totalRevenue, pendingApprovals, activeBookings, monthlyGrowth } | Admin dashboard |
| `/admin/dashboard/activities` | GET | ?limit=10 | { activities: [...] } | Admin dashboard |
| `/admin/dashboard/analytics` | GET | - | { monthlyBookings, statusDistribution, topVendors } | Admin dashboard |
| `/admin/users` | GET | ?role=X&status=Y&page=Z | { users: [...], pagination } | Admin users table |
| `/admin/users/:userId` | GET | - | { user data } | User detail modal |
| `/admin/users/:userId` | PUT | { name, email, phone, role } | { success } | Admin users edit |
| `/admin/users/:userId/block` | POST | { reason } | { success } | Admin users block |
| `/admin/users/:userId` | DELETE | - | { success } | Admin users delete |

---

### **OTP APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/OTP/VerifyOTP` | POST | { booking_id, otp } | { success, message } | OTP verification modal |
| `/OTP/ResendOTP/:bookingId` | POST | - | { success, message } | Resend OTP |
| `/OTP/SendOTP/:bookingId` | POST | - | { success, otp_sent } | Admin send OTP |

---

### **Review APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/Review/SubmitReview` | POST | { booking_id, rating, review_text, service_quality, communication, value_for_money, punctuality } | { success, message } | Review modal/page |

---

### **Notification APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/Notification/GetNotifications` | GET | ?page=X&limit=20&status=X | { notifications: [...], pagination } | Notifications page |
| `/Notification/MarkAsRead/:notificationId` | POST | - | { success } | Mark notification |
| `/Notification/MarkAllAsRead` | POST | - | { success } | Mark all as read |
| `/Notification/DeleteNotification/:notificationId` | DELETE | - | { success } | Delete notification |

---

### **Service APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/Service/GetAllServices` | GET | - | { services: [...] } | Vendor profile form, Services table |
| `/Service/InsertService` | POST | FormData { category_name, description, serviceIcon } | { service_id, success } | Add services form |
| `/Service/UpdateService/:serviceId` | PUT | FormData | { success } | Edit services |
| `/Service/DeleteService/:serviceId` | DELETE | - | { success } | Delete services |

---

### **Shift APIs**

| Endpoint | Method | Request | Response | Used In |
|----------|--------|---------|----------|---------|
| `/ShiftAvailability/GetVendorShifts` | GET | ?vendor_id=X | { shifts: [...] } | Vendor shifts page |
| `/ShiftAvailability/CreateShift` | POST | { shift_name, start_time, end_time, days_of_week } | { shift_id, success } | Add shift form |
| `/ShiftAvailability/UpdateShift/:shiftId` | PUT | { shift_name, start_time, end_time, days_of_week } | { success } | Edit shift |
| `/ShiftAvailability/DeleteShift/:shiftId` | DELETE | - | { success } | Delete shift |

---

---

## Responsive Design Details

### **Breakpoints** (Tailwind CSS)

- **sm:** 640px (small mobile)
- **md:** 768px (tablet portrait)
- **lg:** 1024px (tablet landscape)
- **xl:** 1280px (desktop)
- **2xl:** 1536px (large desktop)

### **Mobile Behavior (< 768px)**

**Navigation:**
- Sidebar hidden by default (toggle via hamburger menu)
- Logo only in navbar
- 3-dot menu for user actions

**Layouts:**
- Single column stacked layouts
- Full-width inputs and buttons
- Modals take 95vw max width

**Tables:**
- Horizontal scroll for tables (not stacked)
- Show 3-5 columns, hide less important ones
- Sticky first column

**Forms:**
- Full width inputs
- Stacked label + input
- Buttons full width

**Cards/Grids:**
- 1 column on mobile
- 2 columns on tablet (sm)
- 3+ columns on desktop

**Font Sizes:**
- H1: 24-28px mobile, 32-48px desktop
- H2: 20-24px mobile, 28-36px desktop
- Body: 14px mobile, 16px desktop

---

### **Tablet Behavior (768px - 1024px)**

- Sidebar visible
- 2-column layouts for cards/content
- Slightly larger spacing
- Touch-friendly button sizes (48px minimum)

---

### **Desktop Behavior (> 1024px)**

- Full sidebar visible (fixed)
- Main content area with responsive width
- 3+ column grids
- Tables with all columns visible
- Hover effects on interactive elements

---

### **Responsive Components**

**MainLayout:**
- Sidebar hidden on mobile, visible on md+
- Sidebar toggle on mobile
- Main content padding adjusts based on screen size

**Navbar:**
- Condensed on mobile
- Full on desktop
- Search bar hidden on mobile

**Sidebar:**
- Drawer overlay on mobile (click outside to close)
- Fixed on desktop

**Tables:**
- Horizontal scroll on mobile
- Normal display on desktop
- Pagination always visible

**Modals:**
- Full screen on mobile with padding
- Centered on desktop with max-width

**Images:**
- max-width: 100% on mobile
- Responsive width attributes

---

---

## UI/UX Notes

### **Design System**

**Primary Colors:**
- **Brand color:** #3C6E71 (teal/forest green)
- **Success:** Green (#22c55e)
- **Warning:** Orange (#f59e0b)
- **Error:** Red (#ef4444)
- **Info:** Blue (#3b82f6)
- **Neutral:** Gray (#6b7280 - #f3f4f6)

**Typography:**
- **Font family:** System stack (Segoe UI, Helvetica, Arial)
- **Heading:** Bold, 1.2-1.4 line height
- **Body:** Regular, 1.5-1.6 line height

**Spacing:**
- **Base unit:** 4px
- **Common:** 8px, 12px, 16px, 24px, 32px

**Shadows:**
- **sm:** 0 1px 2px rgba(0,0,0,0.05)
- **md:** 0 4px 6px rgba(0,0,0,0.1)
- **lg:** 0 10px 15px rgba(0,0,0,0.1)

---

### **Reusable UI Components**

**Buttons:**
- Primary (brand color background, white text)
- Secondary (white background, brand color text, border)
- Danger (red background, white text)
- Link button (text-only, underline on hover)
- Sizes: sm, md, lg (padding varies)

**Cards:**
- White background, subtle shadow
- Rounded corners (8px)
- Hover effect (slight scale, shadow increase)
- Padding: 16-24px

**Badges:**
- Status badges (color-coded by status)
- Tag-like appearance
- Sizes: sm, md
- Colors: success, warning, error, info, neutral

**Modals:**
- Center overlay with backdrop blur
- Header, body, footer sections
- Close button (X in top-right)
- Animations: fade in + scale

**Forms:**
- Material-UI TextField components
- Label + input stacked
- Error messages below field
- Required field indicator (*)
- Help text in gray

**Loading States:**
- Spinner (animated circle)
- Skeleton loaders for tables/lists
- Loading text messages

**Error States:**
- Error banners with icon
- Toast notifications (top-right)
- Inline field errors
- 404 page for not found

**Empty States:**
- Illustration/icon
- Message text
- CTA button to action

---

### **Notifications & Toasts**

**Toast Library:** React Hot Toast

**Types:**
- **Success:** Green icon, "✓ Operation successful"
- **Error:** Red icon, error message
- **Info:** Blue icon, informational message
- **Loading:** Spinner icon, "Processing..."

**Positioning:** Top-right corner
**Duration:** 3 seconds (auto-dismiss)
**Actions:** Manual dismiss (X button) or auto

**Examples:**
```javascript
toast.success("Review submitted successfully!")
toast.error("Failed to save changes")
toast.loading("Loading data...")
```

---

### **Accessibility Considerations**

- **Alt text:** Images have descriptive alt text
- **ARIA labels:** Buttons have aria-label attributes
- **Keyboard navigation:** Tab order logical, interactive elements keyboard accessible
- **Color contrast:** WCAG AA compliant (minimum 4.5:1 for body text)
- **Focus indicators:** Blue outline on focused elements
- **Semantic HTML:** `<button>` for buttons, `<form>` for forms, `<nav>` for navigation
- **Error messages:** Linked to form fields with aria-describedby
- **Icons:** Icon-only buttons have aria-labels
- **Tables:** Proper `<thead>`, `<tbody>`, `<th>` tags for screen readers
- **Links:** Descriptive link text (not "click here")
- **Form labels:** All inputs have associated `<label>` tags

---

---

## File & Folder Mapping

### **Important Frontend Folders & Responsibilities**

| Folder | Purpose | Key Files |
|--------|---------|-----------|
| `src/` | Root source directory | App.jsx, main.jsx |
| `src/pages/` | Full page components | Dashboards, Auth pages, Category pages |
| `src/components/` | Reusable UI components | Layout, modals, form elements |
| `src/services/` | API service layer | bookingService, vendorService, adminService |
| `src/hooks/` | Custom React hooks | useAuth, useApiCall, usePageTracking |
| `src/context/` | Global state providers | AuthContext, ThemeContext |
| `src/routes/` | Route protection | ProtectedRoute |
| `src/utils/` | Utility functions | Validation, error handling, token validation |
| `src/config/` | Configuration | Menu config, image replacements |
| `src/theme/` | Theme definition | MUI theme configuration |
| `src/styles/` | CSS stylesheets | Homepage, calendar styles |
| `src/assets/` | Static assets | Images, logos, icons |

---

### **Key Files Breakdown**

#### **Entry Points**
- **main.jsx** - App bootstrapping, ReactDOM render
- **App.jsx** - Routes definition, ErrorBoundary, AuthProvider setup

#### **Core Context & Providers**
- **context/AuthContext.jsx** - Global authentication state
- **routes/ProtectedRoute.jsx** - Route protection logic

#### **Layouts**
- **components/layout/MainLayout.jsx** - Protected area layout
- **components/layout/Navbar.jsx** - Top navigation
- **components/layout/Sidebar.jsx** - Side navigation menu

#### **Authentication Pages**
- **pages/Auth/Login.jsx** - User login form
- **pages/Auth/Register.jsx** - User registration form
- **pages/Auth/ForgotPassword.jsx** - Password reset request
- **pages/Auth/ResetPassword.jsx** - Password reset completion

#### **Dashboards**
- **pages/Dashboards/User/UserDashboard.jsx** - User overview
- **pages/Dashboards/User/MyBookings.jsx** - User bookings management
- **pages/Dashboards/Vendor/VendorDashboard.jsx** - Vendor overview
- **pages/Dashboards/Vendor/VendorProfileSetup.jsx** - Vendor profile
- **pages/Dashboards/Vendor/VendorBookings.jsx** - Vendor booking requests
- **pages/Dashboards/Vendor/VendorShiftPage.jsx** - Vendor availability
- **pages/Dashboards/Admin/AdminDashboard.jsx** - Admin overview
- **pages/Dashboards/Admin/AdminUsers.jsx** - User management
- **pages/Dashboards/Admin/AdminBookings.jsx** - Booking approval

#### **Public Pages**
- **pages/HomePage.jsx** - Landing page
- **pages/VendorDetail.jsx** - Single vendor detail
- **pages/VendorsByService.jsx** - Vendors list by service
- **pages/ReviewPage.jsx** - Public review submission

#### **Services**
- **services/bookingService.js** - Booking operations
- **services/vendorService.js** - Vendor operations
- **services/adminService.js** - Admin operations
- **services/axiosConfig.js** - Axios instance & interceptors

#### **Utilities**
- **utils/api.js** - API base URL configuration
- **utils/formValidation.js** - Form validation functions
- **utils/tokenValidation.js** - Token expiration checks
- **utils/errorHandler.js** - Error handling utilities

#### **Configuration**
- **config/menuconfig.jsx** - Role-based menu structure
- **theme/theme.js** - MUI theme colors & styles

---

---

## Workflow Diagrams

### **1. User Signup & Login Flow**

```
[Unauth User] 
    ↓
[Visit home page - Can browse, cannot book]
    ↓
[Click "Book Now" on vendor]
    ↓
[Redirect to /login]
    ↓
[User not registered? Click "Register"]
    ↓
[Registration form]
├─ Fill details (name, email, password, user type)
├─ Accept T&C
└─ Submit
    ↓
[POST /User/InsertUser]
    ↓
[Success: Redirect to /login with message]
    ↓
[Login form]
├─ Email + Password
└─ Submit
    ↓
[POST /User/Login]
    ↓
[Response: { token, role, user data }]
    ↓
[Store in localStorage + AuthContext]
    ↓
[Redirect to /user/dashboard (if user role)]
    ↓
[Dashboard loaded with user data]
```

---

### **2. Vendor Booking Request Flow**

```
[User searches for service]
    ↓
[Views vendors for that service]
    ↓
[Selects a vendor → VendorDetail page]
    ↓
[Reviews vendor info, packages, availability]
    ↓
[Clicks "Book Now"]
    ↓
[ShowBookingModal - Select date, package, time]
    ↓
[Submit booking]
    ↓
[POST /Booking/InsertBooking]
    ↓
[Booking created with status: "pending"]
├─ Vendor ID
├─ User ID
├─ Service/package selected
├─ Event date/time
└─ User address
    ↓
[Notifications sent:]
├─ Email to vendor: "New booking request"
└─ Email to admin: "New booking to review"
    ↓
[User redirected to /user/bookings]
    ↓
[Booking shows with status: "Pending Vendor Response"]
```

---

### **3. Vendor Accepts Booking → Admin Approval Flow**

```
[Vendor receives notification]
    ↓
[Logs in → /vendor/bookings]
    ↓
[Sees new booking request]
    ↓
[Chooses: Accept or Reject]
    ├─ ACCEPT:
    │   ├─ [Click "Accept"]
    │   ├─ [POST /Booking/AcceptBooking/:bookingId]
    │   ├─ [Status: "pending" → "accepted"]
    │   ├─ [Email to admin: "Vendor accepted, needs approval"]
    │   └─ [Vendor sees: "Awaiting Admin Approval"]
    │
    └─ REJECT:
        ├─ [Click "Reject"]
        ├─ [Modal: Enter reason]
        ├─ [POST /Booking/RejectBooking/:bookingId]
        ├─ [Status: "rejected_by_vendor"]
        ├─ [Email to user: "Vendor rejected, reason..."]
        └─ [Booking marked as rejected]
    ↓
[Admin receives notification]
    ↓
[Logs in → /admin/bookings]
    ↓
[Sees pending approvals]
    ↓
[Reviews booking details]
    ↓
[Chooses: Approve or Reject]
    ├─ APPROVE:
    │   ├─ [Click "Approve"]
    │   ├─ [POST /Booking/ApproveBooking/:bookingId]
    │   ├─ [Status: "confirmed"]
    │   ├─ [OTP generated + sent to user's email]
    │   └─ [Email to user: "Booking approved! Enter OTP to confirm"]
    │
    └─ REJECT:
        ├─ [Enter rejection reason]
        ├─ [POST /Booking/AdminRejectBooking/:bookingId]
        └─ [Email to user: "Admin rejected, reason..."]
    ↓
[User receives approval email with OTP]
    ↓
[User logs in → /user/bookings]
    ↓
[Booking shows: "Approved - OTP Required"]
    ↓
[Click "Verify OTP"]
    ↓
[OTPVerificationModal]
├─ Enter 6-digit OTP
└─ Submit
    ↓
[POST /OTP/VerifyOTP]
    ↓
[Success: Status → "confirmed"]
    ↓
[Booking now confirmed! User and vendor can communicate]
```

---

### **4. Event Completion & Review Flow**

```
[Event date arrives and passes]
    ↓
[Admin/System marks booking: "completed" → "awaiting_review"]
    ↓
[Email sent to user with review link]
├─ Link: /review/:bookingId?token=xxxxx
└─ Token allows public access without login
    ↓
[User clicks review link]
    ↓
[ReviewPage loads]
├─ Shows booking details
└─ Shows review form
    ↓
[User submits review]
├─ Rating (1-5 stars) - Required
├─ Service quality (1-5) - Optional
├─ Communication (1-5) - Optional
├─ Value for money (1-5) - Optional
├─ Punctuality (1-5) - Optional
└─ Review text - Optional
    ↓
[POST /Review/SubmitReview]
    ↓
[Success: Status → "completed"]
    ↓
[Email confirmation to user]
    ↓
[Review becomes public on vendor profile]
    ↓
[Vendor can see review in profile/dashboard]
    ↓
[Review rating impacts vendor's average rating]
```

---

### **5. User Dashboard & KPIs Flow**

```
[Authenticated user logs in]
    ↓
[Redirected to /user/dashboard]
    ↓
[Page loads MainLayout + UserDashboard]
    ↓
[Dashboard component mounts]
    ↓
[Parallel API calls:]
├─ GET /dashboard/user/kpis → { bookings, totalPayment, savedVendors, tickets }
└─ GET /dashboard/user/monthly → { monthly data for chart }
    ↓
[Data fetched successfully]
    ↓
[KPI cards rendered:]
├─ Total Bookings count
├─ Total Payment (currency formatted)
├─ Saved Vendors count
└─ Support Tickets count
    ↓
[Monthly trend chart rendered]
├─ X-axis: Last 12 months
├─ Y-axis: Bookings count + payments
└─ Interactive tooltips on hover
    ↓
[Recent activities listed]
    ↓
[Quick action links]
├─ "Book Now" → Browse services
└─ "View All Bookings" → /user/bookings
    ↓
[User can interact with dashboard elements]
```

---

### **6. Vendor Profile Setup Flow**

```
[Vendor registers through signup]
    ↓
[Sent email confirmation]
    ↓
[Vendor logs in]
    ↓
[Redirected to /vendor/dashboard]
    ↓
[Dashboard component checks:]
    GET /Vendor/GetVendorProfile
    ↓
[404 Error: Profile not found]
    ↓
[Show: "Complete Your Profile" banner]
    ├─ Button: "Complete Profile"
    └─ Can't access other features until profile complete
    ↓
[User clicks "Complete Profile"]
    ↓
[Navigate to /vendor/profile-setup]
    ↓
[Form loads with fields:]
├─ Business name
├─ Service category (dropdown from API)
├─ Years of experience
├─ Contact number (10 digits)
├─ Business description
├─ Website/social URL
├─ Address details (city, state)
└─ Profile picture upload
    ↓
[User fills form]
    ↓
[Validation on submit:]
├─ All required fields filled
├─ Phone format valid
├─ Picture uploaded (5MB max)
└─ Description min 20 chars
    ↓
[Click "Save Profile"]
    ↓
[POST /Vendor/UpdateVendorProfile (FormData with file)]
    ↓
[Image uploaded separately]
    ↓
[Success: Profile saved]
    ↓
[Toast: "Profile completed successfully!"]
    ↓
[Redirect to /vendor/dashboard]
    ↓
[Dashboard now fully accessible]
    ↓
[Vendor can:]
├─ Manage bookings
├─ Add availability shifts
├─ Upload gallery images
├─ Create packages
└─ View KPIs
```

---

### **7. Admin User Management Flow**

```
[Admin logs in]
    ↓
[Navigates to /admin/users]
    ↓
[AdminUsers page loads]
    ↓
[Fetches: GET /admin/users?role=user&page=1]
    ↓
[Users list displayed in table]
├─ Pagination: 5 per page
├─ Role filter tabs
└─ Search box
    ↓
[Admin can perform actions:]
├─ Filter by role (Users, Vendors, Admins)
├─ Filter by status (Active, Blocked)
├─ Search by name/email
├─ Click user row → View details modal
├─ Edit user details
├─ Block/unblock user
└─ Delete user
    ↓
[Example: Edit user]
    ├─ Click "Edit" button
    ├─ Modal opens with user details
    ├─ Modify fields (name, email, phone)
    ├─ Submit changes
    └─ PUT /admin/users/:userId
    ↓
[Example: Block user]
    ├─ Click "Block" button
    ├─ Modal: Enter reason
    ├─ Submit
    ├─ POST /admin/users/:userId/block
    ├─ User receives notification
    ├─ User can't login anymore
    └─ Admin can unblock later
    ↓
[Admin dashboard updated in real-time]
```

---

---

## Missing/Incomplete Features

### **1. Marketer Module**
- **Status:** Placeholder routes exist
- **Missing:** Campaign creation UI, Lead tracking UI, Analytics
- **TODO:**
  - Create `/marketer/dashboard`
  - Create `/marketer/campaigns`
  - Create `/marketer/leads`
  - Implement campaign creation form
  - Implement lead management table
  - Add analytics/ROI tracking

---

### **2. Direct Messaging/Chat**
- **Status:** Not implemented
- **Needed:**
  - Chat modal between user & vendor
  - Message history
  - Real-time notifications for new messages
  - API endpoints for message CRUD
- **Missing Pages:**
  - Messaging interface
  - Conversation list

---

### **3. Payment Integration**
- **Status:** Form UI exists, actual payment processing missing
- **Missing:**
  - Integration with payment gateway (Razorpay, Stripe, etc.)
  - Payment form with card details
  - Payment verification
  - Invoice generation
  - Refund processing
- **Current State:** `SubscriptionPayment.jsx` is placeholder

---

### **4. Email Verification**
- **Status:** Pages exist but flow not fully tested
- **Missing:**
  - Email verification on registration
  - Verification link expiration handling
  - Resend verification email
- **Existing Routes:**
  - `/verify-email` - Public email verification page
  - `/email-verification` - Handler page
  - `/test-email-verification` - Dev testing page

---

### **5. PWA Implementation**
- **Status:** Partial - PWA install prompt exists
- **Missing:**
  - Service worker configuration
  - Offline functionality
  - App manifest optimization
  - PWA caching strategy
- **Current:** Hook exists (`usePWAInstall`) but limited functionality

---

### **6. Image Cropping/Editor**
- **Status:** Not implemented
- **Needed For:**
  - Profile picture upload with crop tool
  - Gallery image upload with crop
  - Thumbnail generation
- **Current:** Basic file upload only

---

### **7. Real-time Notifications**
- **Status:** API calls exist but not real-time
- **Missing:**
  - WebSocket connection
  - Socket.io integration
  - Real-time booking alerts
  - Real-time review notifications
  - Real-time message notifications

---

### **8. Admin Vendor Approval**
- **Status:** Not implemented
- **Needed:**
  - Vendor registration approval workflow
  - Vendor document verification
  - Vendor tier assignment
  - Vendor suspension/removal
- **Missing Pages:**
  - `/admin/vendor-approvals`

---

### **9. Advanced Filtering & Search**
- **Status:** Basic search exists
- **Missing:**
  - Advanced filters (price range, rating range, availability)
  - Saved filters
  - Filter presets
  - Search history
- **Current:** Simple search by text only

---

### **10. Analytics & Reports**
- **Status:** Dashboard KPIs exist but limited
- **Missing:**
  - Vendor performance reports
  - User behavior analytics
  - Booking trends analysis
  - Revenue reports
  - Export reports (PDF, CSV)
- **Current:** Basic KPI cards only

---

### **11. Subscription Tiers**
- **Status:** Pages exist, full implementation incomplete
- **Missing:**
  - Tier pricing UI
  - Tier feature comparison
  - Upgrade/downgrade flow
  - Usage tracking per tier
  - Billing cycle management
- **Current:** `AdminSubscriptions.jsx` is placeholder

---

### **12. Refund & Cancellation Policy**
- **Status:** Cancellation exists but refund logic missing
- **Missing:**
  - Refund amount calculation
  - Refund initiation process
  - Refund status tracking
  - Cancellation policy display
  - Dispute resolution interface

---

### **13. Rating & Review Moderation**
- **Status:** Basic review submission works
- **Missing:**
  - Review approval workflow
  - Review flagging/reporting
  - Review moderation UI (admin)
  - Filter/sort reviews
  - Review authenticity verification
- **Current:** All reviews immediately public

---

### **14. Vendor Verification**
- **Status:** Not implemented
- **Missing:**
  - Document verification (certificates, licenses)
  - Email verification confirmation
  - Phone verification via OTP
  - Address verification
  - Vendor badge system
- **Current:** No verification required after signup

---

### **15. Favorites/Wishlist**
- **Status:** Mentioned in dashboard KPI but not functional
- **Missing:**
  - Add to favorites button on vendor detail
  - Favorites list page
  - Save for later bookings
  - Notification for price drops
- **TODO:**
  - Add APIs for favorites CRUD
  - Create favorites UI
  - Add to vendor detail page

---

### **16. Multi-Language Support**
- **Status:** Not implemented
- **Missing:**
  - Language toggle in navbar
  - i18n library setup
  - Translation files for all text
  - Localization for dates, currency, numbers
- **Current:** English only

---

### **17. Advanced Calendar Features**
- **Status:** Basic calendar exists
- **Missing:**
  - Blocked dates display
  - Multiple shift selection
  - Shift templates
  - Calendar export (iCal, Google Calendar)
- **Current:** Simple react-calendar only

---

### **18. Mobile App Integration**
- **Status:** Separate mobile app exists (React Native)
- **Missing:**
  - API endpoint documentation for mobile
  - Mobile-specific endpoints
  - Push notification integration
  - Deep linking from web to app
- **Note:** Mobile app is in `mobile-app/` directory

---

### **Known Issues & Bugs**

1. **Token Expiration:** Token expiration check works but refresh endpoint might not be fully implemented
2. **Form Validation:** Some edge cases in validation might not be handled
3. **Error Messages:** Some API errors don't provide user-friendly messages
4. **Mobile:** Some tables don't scroll properly on mobile
5. **Images:** Image compression/optimization not implemented
6. **Performance:** Large vendor lists might have performance issues

---

---

## Quick Reference Guide

### **Common Developer Tasks**

#### **Adding a New Page**
1. Create component in `src/pages/`
2. Add route in `src/App.jsx`
3. If protected, add `<ProtectedRoute allowedRoles={[...]}>`
4. Add navigation link in `menuConfig.jsx` (if dashboard page)
5. Create API service if needed in `src/services/`

#### **Adding a New Form**
1. Create form component with useState for form data
2. Use `validators` from `src/utils/formValidation.js`
3. Show error messages inline
4. Call API service on submit
5. Show toast for success/error
6. Use react-hot-toast for notifications

#### **Adding a New API Call**
1. Create method in appropriate service (`src/services/xxxService.js`)
2. Use axios instance from `axiosConfig`
3. Handle response.data structure
4. Throw error for error handling in component
5. Export from service

#### **Creating Protected Route**
1. Wrap component with `<ProtectedRoute allowedRoles={["role"]}>`
2. Component will redirect to login if not authenticated
3. Will redirect to role dashboard if wrong role

#### **Adding Notification**
```javascript
import toast from 'react-hot-toast'

// In handler
toast.success("Success message")
toast.error("Error message")
toast.loading("Loading...")
```

---

### **Code Examples**

#### **Fetching Data on Page Load**
```javascript
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await bookingService.getUserBookings()
      setData(response.data?.bookings || [])
    } catch (err) {
      setError(err.message)
      toast.error("Failed to load data")
    } finally {
      setLoading(false)
    }
  }
  fetchData()
}, [])
```

#### **Form Submission**
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Validate
  const errors = validate()
  if (Object.keys(errors).length > 0) {
    setErrors(errors)
    return
  }
  
  // Submit
  try {
    setLoading(true)
    await bookingService.createBooking(formData)
    toast.success("Booking created!")
    navigate("/user/bookings")
  } catch (error) {
    toast.error(error.response?.data?.message || "Error")
  } finally {
    setLoading(false)
  }
}
```

#### **Conditional Rendering Based on Role**
```javascript
const { user } = useAuth()

if (user?.role === "admin") {
  return <AdminView />
} else if (user?.role === "vendor") {
  return <VendorView />
} else {
  return <UserView />
}
```

---

### **Debugging Tips**

1. **Check AuthContext:** Log `useAuth()` to see current user/token
2. **Check LocalStorage:** `localStorage.getItem("token")` to verify token storage
3. **Check API Calls:** Use Network tab in DevTools to see requests/responses
4. **Check Route Protection:** Verify `ProtectedRoute` is wrapping components
5. **Check Form Errors:** Look at validation error messages
6. **Check Console Errors:** React errors, promise rejections
7. **Check Token Expiration:** Verify token isn't expired with `isTokenExpired()`

---

---

## Final Notes

### **Architecture Philosophy**

- **Modular:** Each feature in its own folder/file
- **Reusable:** Common components, hooks, utilities
- **Scalable:** Easy to add new pages, roles, features
- **Maintainable:** Clear naming, consistent patterns
- **Secure:** Protected routes, token management, input validation

### **Performance Considerations**

- Lazy load routes (React.lazy() if needed)
- Optimize images
- Memoize expensive computations
- Avoid unnecessary re-renders
- Use pagination for large lists
- Consider caching API responses

### **Future Improvements**

- Add unit & integration tests
- Implement error logging/monitoring (Sentry, etc.)
- Add performance monitoring (Lighthouse, WebVitals)
- Implement dark mode properly
- Add multi-language support
- Optimize bundle size
- Add PWA features
- Implement real-time features with WebSockets

---

**End of Frontend Complete Documentation**

---

