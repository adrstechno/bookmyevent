import toast from "react-hot-toast";

// Error types
export const ERROR_TYPES = {
    NETWORK: 'NETWORK',
    NO_DATA: 'NO_DATA',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    NOT_FOUND: 'NOT_FOUND',
    SERVER_ERROR: 'SERVER_ERROR',
    VALIDATION: 'VALIDATION',
    UNKNOWN: 'UNKNOWN'
};

// Error messages
export const ERROR_MESSAGES = {
    [ERROR_TYPES.NETWORK]: "Unable to connect to server. Please check your internet connection.",
    [ERROR_TYPES.NO_DATA]: "No data found.",
    [ERROR_TYPES.UNAUTHORIZED]: "Please log in to continue.",
    [ERROR_TYPES.FORBIDDEN]: "You don't have permission to access this resource.",
    [ERROR_TYPES.NOT_FOUND]: "The requested resource was not found.",
    [ERROR_TYPES.SERVER_ERROR]: "Something went wrong on our end. Please try again later.",
    [ERROR_TYPES.VALIDATION]: "Please check your input and try again.",
    [ERROR_TYPES.UNKNOWN]: "An unexpected error occurred. Please try again."
};

// Determine error type from response
export const getErrorType = (error) => {
    if (!error.response) {
        return ERROR_TYPES.NETWORK;
    }

    const status = error.response.status;

    switch (status) {
        case 401:
            return ERROR_TYPES.UNAUTHORIZED;
        case 403:
            return ERROR_TYPES.FORBIDDEN;
        case 404:
            return ERROR_TYPES.NOT_FOUND;
        case 400:
            return ERROR_TYPES.VALIDATION;
        case 500:
        case 502:
        case 503:
            return ERROR_TYPES.SERVER_ERROR;
        default:
            return ERROR_TYPES.UNKNOWN;
    }
};

// Handle API errors consistently
export const handleApiError = (error, customMessage = null, showToast = true) => {
    const errorType = getErrorType(error);
    const message = customMessage || error.response?.data?.message || ERROR_MESSAGES[errorType];

    if (showToast) {
        toast.error(message);
    }

    return {
        type: errorType,
        message,
        status: error.response?.status,
        data: error.response?.data
    };
};

// Check if data is empty
export const isDataEmpty = (data) => {
    if (!data) return true;
    if (Array.isArray(data)) return data.length === 0;
    if (typeof data === 'object') return Object.keys(data).length === 0;
    return false;
};

// API response handler
export const handleApiResponse = (response, options = {}) => {
    const {
        emptyMessage = "No data found",
        showEmptyToast = false
    } = options;

    if (!response.data || isDataEmpty(response.data)) {
        if (showEmptyToast) {
            toast.info(emptyMessage);
        }
        return {
            success: true,
            data: null,
            isEmpty: true,
            message: emptyMessage
        };
    }

    return {
        success: true,
        data: response.data,
        isEmpty: false,
        message: response.data.message || "Success"
    };
};

// Loading states
export const LOADING_STATES = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error',
    EMPTY: 'empty'
};