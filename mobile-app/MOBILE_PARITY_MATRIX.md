# Mobile Parity Matrix (Web to Mobile)

## Scope
- Single app with role-based routing.
- Roles in v1: user, vendor, admin.
- Marketer excluded for now.

## Foundation Status
- Done: real backend auth integration in mobile state flow.
- Done: role-based route entry for user, vendor, admin.
- Done: route guards by role at group level.
- Next: implement each role module using this matrix.

## Route and Feature Mapping

| Web module | Web path(s) | Mobile target | Role | Backend endpoints |
|---|---|---|---|---|
| Login/Register | /login, /register | /(auth)/login | user, vendor, admin login + user/vendor register | /User/Login, /User/InsertUser |
| User dashboard | /user/dashboard | /(tabs)/home (then dedicated user dashboard screen) | user | /dashboard/user/kpis, /dashboard/user/monthly |
| User bookings | /user/bookings | /(tabs)/bookings | user | /Booking/GetBookingsByUserId, /bookings/:id/cancel |
| Notifications | /notifications | shared notifications screen | user, vendor, admin | /notification/* |
| Services listing | /services, /services-by-category/:categoryId | /(tabs)/categories | user | /Service/GetAllServices, /Service/GetSubservicesByServiceCategoryId/:id |
| Vendor listing/detail | /vendors, /vendor/:vendorId | categories stack detail screens | user | /Vendor/Getallvendors, /Vendor/GetVendorProfile, /Vendor/getVendorShiftforVendor |
| Booking create flow | Vendor detail + booking modal | categories stack booking flow | user | /Booking/InsertBooking, /bookings/ |
| OTP verification | booking workflow modal | booking flow OTP screen/modal | user, vendor | /otp/generate, /otp/verify, /otp/status |
| Reviews | review page/modals | review screens attached to bookings/vendor detail | user | /reviews/bookings/:id, /reviews/vendor/:vendorId |
| Vendor dashboard | /vendor/dashboard | /(vendor)/dashboard | vendor | /Vendor/GetVendorKPIs, /Vendor/GetVendorRecentActivities |
| Vendor profile setup | /vendor/profile-setup | /(vendor)/profile-setup | vendor | /Vendor/InsertVendor, /Vendor/updateVendorProfile |
| Vendor shifts | /vendor/shifts | /(vendor)/shifts | vendor | /Vendor/AddvendorShifts, /Vendor/getVendorShiftforVendor |
| Vendor bookings | /vendor/bookings | /(vendor)/bookings | vendor | /Booking/GetBookingsByVendorId, /bookings/:id/accept, /bookings/:id/reject |
| Vendor packages | /vendor/mypackege | /(vendor)/packages | vendor | /Vendor/insertVendorPackage, /Vendor/updateVendorPackage |
| Vendor gallery/events | /vendor/gallery, /vendor/myevents | /(vendor)/gallery, /(vendor)/events | vendor | /Vendor/GetvendorEventImages |
| Vendor manual reservations | /vendor/reservations | /(vendor)/reservations | vendor | /manual-reservations/* |
| Vendor settings/subscription | /vendor/setting | /(vendor)/settings, /(vendor)/subscription | vendor | /subscription/status, /subscription/create-order |
| Admin dashboard | /admin/dashboard | /(admin)/dashboard | admin | /admin/dashboard/kpis, /admin/dashboard/activities, /admin/dashboard/analytics |
| Admin users | /admin/users | /(admin)/users | admin | /admin/users |
| Admin services | /admin/addservices, /admin/mainservice | /(admin)/services | admin | /Service/InsertService, /Service/UpdateService/:id, /Service/DeleteService/:id |
| Admin bookings | /admin/bookings | /(admin)/bookings | admin | /bookings/admin/all-bookings, /bookings/:id/approve |
| Admin reservations | /admin/reservations | /(admin)/reservations | admin | /manual-reservations/* |
| Admin subscriptions | /admin/subscriptions | /(admin)/subscriptions | admin | /subscription/all, /subscription/stats |

## UX Upgrade Rules for Mobile
- Replace table-heavy pages with card lists and filter sheets.
- Use sticky bottom CTA for create/submit actions.
- Collapse long forms into sectioned steps.
- Keep dashboard KPI cards scannable first, charts second.
- Prefer inline status chips and timeline views for bookings.

## Implementation Order
1. User booking funnel end-to-end (browse -> book -> status -> review).
2. Vendor booking operations and shifts.
3. Admin booking moderation and users/services management.
4. Notifications and subscription/payment refinement.

## Acceptance Checklist
- Role login lands on correct role home.
- Cross-role navigation is blocked.
- Each mapped web module has a mobile route.
- API calls for implemented modules use existing backend endpoints.
- Booking status and OTP flow match backend states.
