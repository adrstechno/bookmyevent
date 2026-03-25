/**
 * Google Analytics Utility Functions
 * 
 * This file provides helper functions to track events and page views
 * in Google Analytics throughout the application.
 */

// Check if gtag is available
const isGtagAvailable = () => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Track page view
 * @param {string} path - The page path (e.g., '/about', '/vendors/123')
 * @param {string} title - The page title
 */
export const trackPageView = (path, title) => {
  if (isGtagAvailable()) {
    window.gtag('config', 'G-G33PWKLMGM', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Track custom event
 * @param {string} action - The action being tracked (e.g., 'click', 'submit')
 * @param {string} category - The category of the event (e.g., 'Button', 'Form')
 * @param {string} label - Optional label for the event
 * @param {number} value - Optional numeric value
 */
export const trackEvent = (action, category, label = '', value = null) => {
  if (isGtagAvailable()) {
    const eventParams = {
      event_category: category,
      event_label: label,
    };

    if (value !== null) {
      eventParams.value = value;
    }

    window.gtag('event', action, eventParams);
  }
};

/**
 * Track vendor view
 * @param {number} vendorId - The vendor ID
 * @param {string} vendorName - The vendor name
 */
export const trackVendorView = (vendorId, vendorName) => {
  trackEvent('view_vendor', 'Vendor', `${vendorName} (ID: ${vendorId})`);
};

/**
 * Track service category view
 * @param {string} categoryName - The category name
 */
export const trackCategoryView = (categoryName) => {
  trackEvent('view_category', 'Category', categoryName);
};

/**
 * Track search
 * @param {string} searchTerm - The search term
 */
export const trackSearch = (searchTerm) => {
  if (isGtagAvailable()) {
    window.gtag('event', 'search', {
      search_term: searchTerm,
    });
  }
};

/**
 * Track booking initiation
 * @param {number} vendorId - The vendor ID
 * @param {string} vendorName - The vendor name
 * @param {number} amount - The booking amount
 */
export const trackBookingStart = (vendorId, vendorName, amount) => {
  if (isGtagAvailable()) {
    window.gtag('event', 'begin_checkout', {
      currency: 'INR',
      value: amount,
      items: [
        {
          item_id: vendorId,
          item_name: vendorName,
          item_category: 'Vendor Booking',
          price: amount,
          quantity: 1,
        },
      ],
    });
  }
};

/**
 * Track successful booking
 * @param {number} bookingId - The booking ID
 * @param {number} vendorId - The vendor ID
 * @param {string} vendorName - The vendor name
 * @param {number} amount - The booking amount
 */
export const trackBookingComplete = (bookingId, vendorId, vendorName, amount) => {
  if (isGtagAvailable()) {
    window.gtag('event', 'purchase', {
      transaction_id: bookingId,
      currency: 'INR',
      value: amount,
      items: [
        {
          item_id: vendorId,
          item_name: vendorName,
          item_category: 'Vendor Booking',
          price: amount,
          quantity: 1,
        },
      ],
    });
  }
};

/**
 * Track user registration
 * @param {string} method - Registration method (e.g., 'email', 'google')
 */
export const trackSignUp = (method = 'email') => {
  if (isGtagAvailable()) {
    window.gtag('event', 'sign_up', {
      method: method,
    });
  }
};

/**
 * Track user login
 * @param {string} method - Login method (e.g., 'email', 'google')
 */
export const trackLogin = (method = 'email') => {
  if (isGtagAvailable()) {
    window.gtag('event', 'login', {
      method: method,
    });
  }
};

/**
 * Track button click
 * @param {string} buttonName - The button name/label
 * @param {string} location - Where the button is located
 */
export const trackButtonClick = (buttonName, location) => {
  trackEvent('click', 'Button', `${buttonName} - ${location}`);
};

/**
 * Track form submission
 * @param {string} formName - The form name
 * @param {boolean} success - Whether submission was successful
 */
export const trackFormSubmit = (formName, success = true) => {
  trackEvent(
    success ? 'form_submit_success' : 'form_submit_error',
    'Form',
    formName
  );
};

/**
 * Track date filter usage
 * @param {string} date - The selected date
 * @param {string} context - Where the filter was used
 */
export const trackDateFilter = (date, context) => {
  trackEvent('filter_by_date', 'Filter', `${date} - ${context}`);
};

/**
 * Track category filter usage
 * @param {string} categoryName - The selected category
 */
export const trackCategoryFilter = (categoryName) => {
  trackEvent('filter_by_category', 'Filter', categoryName);
};

/**
 * Track outbound link click
 * @param {string} url - The destination URL
 * @param {string} label - Optional label
 */
export const trackOutboundLink = (url, label = '') => {
  if (isGtagAvailable()) {
    window.gtag('event', 'click', {
      event_category: 'Outbound Link',
      event_label: label || url,
      transport_type: 'beacon',
    });
  }
};

/**
 * Track error
 * @param {string} errorMessage - The error message
 * @param {string} location - Where the error occurred
 */
export const trackError = (errorMessage, location) => {
  trackEvent('error', 'Error', `${location}: ${errorMessage}`);
};

/**
 * Track subscription
 * @param {string} plan - The subscription plan
 * @param {number} amount - The subscription amount
 */
export const trackSubscription = (plan, amount) => {
  if (isGtagAvailable()) {
    window.gtag('event', 'purchase', {
      transaction_id: `sub_${Date.now()}`,
      currency: 'INR',
      value: amount,
      items: [
        {
          item_id: plan,
          item_name: `Subscription - ${plan}`,
          item_category: 'Subscription',
          price: amount,
          quantity: 1,
        },
      ],
    });
  }
};

/**
 * Set user properties
 * @param {object} properties - User properties to set
 */
export const setUserProperties = (properties) => {
  if (isGtagAvailable()) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Track timing
 * @param {string} category - Timing category
 * @param {string} variable - Timing variable
 * @param {number} value - Time in milliseconds
 * @param {string} label - Optional label
 */
export const trackTiming = (category, variable, value, label = '') => {
  if (isGtagAvailable()) {
    window.gtag('event', 'timing_complete', {
      name: variable,
      value: value,
      event_category: category,
      event_label: label,
    });
  }
};

export default {
  trackPageView,
  trackEvent,
  trackVendorView,
  trackCategoryView,
  trackSearch,
  trackBookingStart,
  trackBookingComplete,
  trackSignUp,
  trackLogin,
  trackButtonClick,
  trackFormSubmit,
  trackDateFilter,
  trackCategoryFilter,
  trackOutboundLink,
  trackError,
  trackSubscription,
  setUserProperties,
  trackTiming,
};
