// Comprehensive Form Validation Utility
// Created by: Senior Frontend Developer
// Purpose: Reusable validation functions for all forms

export const validators = {
  // Email validation
  email: (value) => {
    if (!value) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Please enter a valid email address";
    return "";
  },

  // Phone number validation (Indian format)
  phone: (value) => {
    if (!value) return "Phone number is required";
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(value)) return "Please enter a valid 10-digit phone number";
    return "";
  },

  // Password validation
  password: (value) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    if (value.length > 50) return "Password must be less than 50 characters";
    return "";
  },

  // Confirm password validation
  confirmPassword: (value, password) => {
    if (!value) return "Please confirm your password";
    if (value !== password) return "Passwords do not match";
    return "";
  },

  // Required field validation
  required: (value, fieldName = "This field") => {
    if (!value || (typeof value === "string" && !value.trim())) {
      return `${fieldName} is required`;
    }
    return "";
  },

  // Name validation (letters, spaces, hyphens only)
  name: (value, fieldName = "Name") => {
    if (!value) return `${fieldName} is required`;
    const nameRegex = /^[a-zA-Z\s-]+$/;
    if (!nameRegex.test(value)) return `${fieldName} can only contain letters, spaces, and hyphens`;
    if (value.length < 2) return `${fieldName} must be at least 2 characters`;
    if (value.length > 50) return `${fieldName} must be less than 50 characters`;
    return "";
  },

  // Number validation
  number: (value, fieldName = "This field") => {
    if (!value) return `${fieldName} is required`;
    if (isNaN(value)) return `${fieldName} must be a number`;
    return "";
  },

  // Positive number validation
  positiveNumber: (value, fieldName = "This field") => {
    if (!value) return `${fieldName} is required`;
    if (isNaN(value)) return `${fieldName} must be a number`;
    if (Number(value) <= 0) return `${fieldName} must be greater than 0`;
    return "";
  },

  // Amount validation
  amount: (value) => {
    if (!value) return "Amount is required";
    if (isNaN(value)) return "Amount must be a number";
    if (Number(value) < 0) return "Amount cannot be negative";
    if (Number(value) > 10000000) return "Amount is too large";
    return "";
  },

  // Address validation
  address: (value) => {
    if (!value) return "Address is required";
    if (value.length < 10) return "Address must be at least 10 characters";
    if (value.length > 200) return "Address must be less than 200 characters";
    return "";
  },

  // City validation
  city: (value) => {
    if (!value) return "City is required";
    const cityRegex = /^[a-zA-Z\s]+$/;
    if (!cityRegex.test(value)) return "City can only contain letters and spaces";
    if (value.length < 2) return "City must be at least 2 characters";
    return "";
  },

  // State validation
  state: (value) => {
    if (!value) return "State is required";
    return "";
  },

  // Description validation
  description: (value, minLength = 10, maxLength = 500) => {
    if (!value) return "Description is required";
    if (value.length < minLength) return `Description must be at least ${minLength} characters`;
    if (value.length > maxLength) return `Description must be less than ${maxLength} characters`;
    return "";
  },

  // Years of experience validation
  experience: (value) => {
    if (!value) return "Years of experience is required";
    if (isNaN(value)) return "Experience must be a number";
    if (Number(value) < 0) return "Experience cannot be negative";
    if (Number(value) > 50) return "Experience seems too high";
    return "";
  },

  // Date validation
  date: (value, fieldName = "Date") => {
    if (!value) return `${fieldName} is required`;
    const selectedDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selectedDate < today) return `${fieldName} cannot be in the past`;
    return "";
  },

  // Time validation
  time: (value) => {
    if (!value) return "Time is required";
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(value)) return "Please enter a valid time (HH:MM)";
    return "";
  },

  // URL validation
  url: (value, fieldName = "URL") => {
    if (!value) return "";
    try {
      new URL(value);
      return "";
    } catch {
      return `Please enter a valid ${fieldName}`;
    }
  },

  // Package name validation
  packageName: (value) => {
    if (!value) return "Package name is required";
    if (value.length < 3) return "Package name must be at least 3 characters";
    if (value.length > 100) return "Package name must be less than 100 characters";
    return "";
  },

  // Business name validation
  businessName: (value) => {
    if (!value) return "Business name is required";
    if (value.length < 3) return "Business name must be at least 3 characters";
    if (value.length > 100) return "Business name must be less than 100 characters";
    return "";
  },
};

// Input sanitization functions
export const sanitizers = {
  // Remove non-numeric characters
  numbersOnly: (value) => {
    return value.replace(/\D/g, "");
  },

  // Remove non-alphabetic characters (except spaces and hyphens)
  lettersOnly: (value) => {
    return value.replace(/[^a-zA-Z\s-]/g, "");
  },

  // Trim whitespace
  trim: (value) => {
    return value.trim();
  },

  // Lowercase
  lowercase: (value) => {
    return value.toLowerCase();
  },

  // Remove extra spaces
  removeExtraSpaces: (value) => {
    return value.replace(/\s+/g, " ").trim();
  },

  // Phone number formatter (adds spaces for readability)
  formatPhone: (value) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length <= 10) {
      return cleaned;
    }
    return cleaned.slice(0, 10);
  },

  // Amount formatter (allows only numbers and decimal point)
  formatAmount: (value) => {
    return value.replace(/[^\d.]/g, "").replace(/(\..*)\./g, "$1");
  },
};

// Form validation hook
export const useFormValidation = (initialState, validationRules) => {
  const [values, setValues] = React.useState(initialState);
  const [errors, setErrors] = React.useState({});
  const [touched, setTouched] = React.useState({});

  const validateField = (name, value) => {
    if (validationRules[name]) {
      return validationRules[name](value, values);
    }
    return "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    
    // Validate on change if field was touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateAll = () => {
    const newErrors = {};
    let isValid = true;

    Object.keys(validationRules).forEach((field) => {
      const error = validateField(field, values[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(
      Object.keys(validationRules).reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {})
    );

    return isValid;
  };

  const resetForm = () => {
    setValues(initialState);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    validateAll,
    resetForm,
    setValues,
    setErrors,
  };
};

// Reusable Input Component with validation
export const ValidatedInput = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  required = false,
  disabled = false,
  className = "",
  maxLength,
  pattern,
  inputMode,
}) => {
  const showError = touched && error;

  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        pattern={pattern}
        inputMode={inputMode}
        className={`
          w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors
          ${showError 
            ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
            : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          }
          ${disabled ? "bg-gray-100 cursor-not-allowed" : "bg-white"}
          ${className}
        `}
      />
      {showError && (
        <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
};

export default validators;
