# Deployment Checklist - Responsive & Dynamic Categories

## Pre-Deployment Testing

### 1. Backend API Verification
- [ ] Verify `/service/GetAllServices` API is working
- [ ] Verify `/Subservice/GetSubservicesByCategory` API is working
- [ ] Test API responses include all required fields
- [ ] Check API performance (response time < 500ms)
- [ ] Verify CORS settings allow frontend domain

### 2. Frontend Build
```bash
cd Frontend
npm install
npm run build
```

- [ ] Build completes without errors
- [ ] No TypeScript/ESLint errors
- [ ] Bundle size is reasonable (< 1MB gzipped)
- [ ] All assets are included in dist folder

### 3. Responsive Testing

#### Mobile Testing (Required):
- [ ] iPhone SE (375px) - Safari
- [ ] iPhone 12/13 (390px) - Safari
- [ ] Samsung Galaxy S21 (360px) - Chrome
- [ ] Test in portrait and landscape modes
- [ ] Verify touch targets are at least 44x44px
- [ ] Test hamburger menu functionality
- [ ] Test category dropdown on mobile
- [ ] Verify no horizontal scroll

#### Tablet Testing (Required):
- [ ] iPad (768px) - Safari
- [ ] iPad Pro (1024px) - Safari
- [ ] Test in portrait and landscape modes
- [ ] Verify grid layouts adapt correctly
- [ ] Test navigation transitions

#### Desktop Testing (Required):
- [ ] 13" Laptop (1280px) - Chrome
- [ ] 15" Laptop (1440px) - Chrome
- [ ] 24" Monitor (1920px) - Chrome
- [ ] 27" Monitor (2560px) - Chrome
- [ ] Test hover effects
- [ ] Verify dropdown menus
- [ ] Test all navigation links

### 4. Feature Testing

#### Dynamic Categories:
- [ ] Categories load from API
- [ ] Loading state shows spinner
- [ ] Empty state shows message
- [ ] Error state shows retry button
- [ ] Clicking category navigates correctly
- [ ] Category icons display properly
- [ ] Category colors are correct

#### ServicesByCategory Page:
- [ ] Page loads without errors
- [ ] Sub-services fetch from API
- [ ] Grid layout is responsive
- [ ] Cards have equal heights
- [ ] Images load correctly
- [ ] Clicking service navigates to vendors
- [ ] Back button works
- [ ] Loading/error/empty states work

#### VendorsByService Page:
- [ ] Vendors load correctly
- [ ] Filter buttons work
- [ ] Calendar modal is responsive
- [ ] Pagination works
- [ ] Vendor cards are clickable
- [ ] Navigation state is preserved

### 5. Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 6. Performance Testing
- [ ] Lighthouse score > 90 (Performance)
- [ ] Lighthouse score > 90 (Accessibility)
- [ ] Lighthouse score > 90 (Best Practices)
- [ ] Lighthouse score > 90 (SEO)
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] No console errors
- [ ] No console warnings (production)

### 7. Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast ratios meet WCAG AA
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Alt text on all images
- [ ] Form labels associated correctly

## Deployment Steps

### 1. Backend Deployment (if needed)
```bash
# SSH to server
ssh ubuntu@your-ec2-ip

# Navigate to project
cd /home/ubuntu/bookmyevent

# Pull latest changes
git pull origin main

# Restart backend
pm2 restart goeventify-backend

# Check logs
pm2 logs goeventify-backend --lines 50
```

### 2. Frontend Deployment

#### Option A: Vercel (Recommended)
```bash
cd Frontend
vercel --prod
```

#### Option B: Netlify
```bash
cd Frontend
netlify deploy --prod
```

#### Option C: Manual
```bash
cd Frontend
npm run build
# Upload dist folder to hosting
```

### 3. Post-Deployment Verification

#### Immediate Checks:
- [ ] Homepage loads
- [ ] Navbar displays correctly
- [ ] Categories dropdown works
- [ ] Click through full user flow
- [ ] Check browser console for errors
- [ ] Verify API calls succeed
- [ ] Test on mobile device (real device)

#### Full Flow Test:
1. [ ] Visit homepage
2. [ ] Click "Categories" in navbar
3. [ ] Select a category
4. [ ] Verify ServicesByCategory page loads
5. [ ] Click a sub-service
6. [ ] Verify VendorsByService page loads
7. [ ] Click a vendor
8. [ ] Verify VendorDetail page loads
9. [ ] Test back navigation
10. [ ] Test on mobile device

### 4. Monitoring Setup
- [ ] Setup error tracking (Sentry/LogRocket)
- [ ] Setup analytics (Google Analytics/Mixpanel)
- [ ] Setup uptime monitoring
- [ ] Setup performance monitoring
- [ ] Configure alerts for errors

## Rollback Plan

If issues are found:

### Frontend Rollback:
```bash
# Vercel
vercel rollback

# Netlify
netlify rollback

# Manual
# Restore previous dist folder
```

### Backend Rollback:
```bash
ssh ubuntu@your-ec2-ip
cd /home/ubuntu/bookmyevent
git reset --hard HEAD~1
pm2 restart goeventify-backend
```

## Post-Deployment Tasks

### Day 1:
- [ ] Monitor error logs
- [ ] Check analytics for traffic
- [ ] Verify all pages load correctly
- [ ] Test on multiple devices
- [ ] Collect user feedback

### Week 1:
- [ ] Review performance metrics
- [ ] Check for any reported bugs
- [ ] Monitor API response times
- [ ] Review user behavior analytics
- [ ] Optimize based on data

## Common Issues & Solutions

### Issue: Categories not loading
**Solution:**
1. Check backend API is running
2. Verify CORS settings
3. Check browser console for errors
4. Verify API endpoint URL is correct

### Issue: Layout breaks on mobile
**Solution:**
1. Check for fixed widths
2. Verify responsive classes are applied
3. Test with Chrome DevTools device mode
4. Check for overflow issues

### Issue: Images not loading
**Solution:**
1. Verify image URLs are correct
2. Check CORS for image hosting
3. Verify image paths in build
4. Check network tab for 404s

### Issue: Navigation not working
**Solution:**
1. Check React Router configuration
2. Verify route paths match
3. Check for JavaScript errors
4. Verify state is passed correctly

## Success Criteria

Deployment is successful when:
- ✅ All pages load without errors
- ✅ Categories load dynamically from API
- ✅ Navigation flow works end-to-end
- ✅ Responsive on all tested devices
- ✅ No console errors in production
- ✅ Performance scores > 90
- ✅ Accessibility scores > 90
- ✅ User can complete booking flow
- ✅ All API calls succeed
- ✅ Error handling works correctly

## Contact Information

**Frontend Issues:**
- Check: Browser console, Network tab
- Logs: Vercel/Netlify dashboard

**Backend Issues:**
- Check: `pm2 logs goeventify-backend`
- Server: SSH to EC2 instance

**Emergency Contacts:**
- Developer: [Your contact]
- DevOps: [DevOps contact]
- Product: [Product contact]

---

## Final Checklist Before Going Live

- [ ] All tests passed
- [ ] Code reviewed
- [ ] Documentation updated
- [ ] Backup created
- [ ] Rollback plan ready
- [ ] Monitoring configured
- [ ] Team notified
- [ ] Stakeholders informed

**Deployment Date:** _____________
**Deployed By:** _____________
**Version:** _____________
**Notes:** _____________
