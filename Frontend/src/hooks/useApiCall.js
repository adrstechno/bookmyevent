import { useState, useCallback } from 'react';
import { handleApiError, handleApiResponse, LOADING_STATES } from '../utils/errorHandler';

export const useApiCall = (initialState = null) => {
    const [data, setData] = useState(initialState);
    const [loading, setLoading] = useState(LOADING_STATES.IDLE);
    const [error, setError] = useState(null);

    const execute = useCallback(async (apiCall, options = {}) => {
        const {
            onSuccess = null,
            onError = null,
            showToast = true,
            emptyMessage = "No data found",
            showEmptyToast = false
        } = options;

        try {
            setLoading(LOADING_STATES.LOADING);
            setError(null);

            const response = await apiCall();
            const result = handleApiResponse(response, { emptyMessage, showEmptyToast });

            if (result.isEmpty) {
                setLoading(LOADING_STATES.EMPTY);
                setData(null);
            } else {
                setLoading(LOADING_STATES.SUCCESS);
                setData(result.data);
            }

            if (onSuccess) {
                onSuccess(result);
            }

            return result;
        } catch (err) {
            const errorInfo = handleApiError(err, null, showToast);
            setError(errorInfo);
            setLoading(LOADING_STATES.ERROR);
            setData(null);

            if (onError) {
                onError(errorInfo);
            }

            throw errorInfo;
        }
    }, []);

    const reset = useCallback(() => {
        setData(initialState);
        setLoading(LOADING_STATES.IDLE);
        setError(null);
    }, [initialState]);

    return {
        data,
        loading,
        error,
        execute,
        reset,
        isLoading: loading === LOADING_STATES.LOADING,
        isSuccess: loading === LOADING_STATES.SUCCESS,
        isError: loading === LOADING_STATES.ERROR,
        isEmpty: loading === LOADING_STATES.EMPTY,
        isIdle: loading === LOADING_STATES.IDLE
    };
};