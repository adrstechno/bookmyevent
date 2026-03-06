// Database retry utility for handling connection resets
import db from '../Config/DatabaseCon.js';

/**
 * Execute a database query with automatic retry on connection errors
 * @param {string} query - SQL query to execute
 * @param {Array} params - Query parameters
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - Query results
 */
export const executeWithRetry = async (query, params = [], maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                db.query(query, params, (err, results) => {
                    if (err) {
                        // Check if it's a connection error that can be retried
                        if (isRetryableError(err) && attempt < maxRetries) {
                            console.log(`Database query failed (attempt ${attempt}/${maxRetries}), retrying...`);
                            reject(err);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            lastError = error;
            
            // If it's a retryable error and we have attempts left, wait and retry
            if (isRetryableError(error) && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff
                console.log(`Waiting ${delay}ms before retry...`);
                await sleep(delay);
                continue;
            }
            
            // If not retryable or out of attempts, throw the error
            throw error;
        }
    }
    
    throw lastError;
};

/**
 * Check if an error is retryable
 * @param {Error} error - The error to check
 * @returns {boolean} - True if the error is retryable
 */
const isRetryableError = (error) => {
    const retryableCodes = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'PROTOCOL_CONNECTION_LOST',
        'PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR',
        'ER_LOCK_DEADLOCK',
        'ER_LOCK_WAIT_TIMEOUT'
    ];
    
    return retryableCodes.includes(error.code) || 
           retryableCodes.includes(error.errno) ||
           (error.fatal && error.code === 'ECONNRESET');
};

/**
 * Sleep utility
 * @param {number} ms - Milliseconds to sleep
 * @returns {Promise}
 */
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Execute a callback-based database operation with retry
 * @param {Function} operation - Database operation function
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise}
 */
export const executeCallbackWithRetry = async (operation, maxRetries = 3) => {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await new Promise((resolve, reject) => {
                operation((err, results) => {
                    if (err) {
                        if (isRetryableError(err) && attempt < maxRetries) {
                            console.log(`Database operation failed (attempt ${attempt}/${maxRetries}), retrying...`);
                            reject(err);
                        } else {
                            reject(err);
                        }
                    } else {
                        resolve(results);
                    }
                });
            });
        } catch (error) {
            lastError = error;
            
            if (isRetryableError(error) && attempt < maxRetries) {
                const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
                console.log(`Waiting ${delay}ms before retry...`);
                await sleep(delay);
                continue;
            }
            
            throw error;
        }
    }
    
    throw lastError;
};

export default {
    executeWithRetry,
    executeCallbackWithRetry
};