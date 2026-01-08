import React from "react";
import {
    ExclamationTriangleIcon,
    InformationCircleIcon,
    ArrowPathIcon,
    WifiIcon
} from "@heroicons/react/24/outline";

// Loading Component
export const LoadingSpinner = ({ message = "Loading...", size = "md" }) => {
    const sizeClasses = {
        sm: "h-6 w-6",
        md: "h-12 w-12",
        lg: "h-16 w-16"
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <div className={`animate-spin rounded-full border-b-2 border-[#3c6e71] ${sizeClasses[size]} mb-4`}></div>
            <p className="text-gray-600 text-sm">{message}</p>
        </div>
    );
};

// No Data Component
export const NoDataFound = ({
    message = "No data found",
    description = null,
    icon = null,
    actionButton = null
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4">
                {icon || <InformationCircleIcon className="h-16 w-16 text-gray-400" />}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
            {description && (
                <p className="text-gray-500 text-sm mb-4 max-w-md">{description}</p>
            )}
            {actionButton}
        </div>
    );
};

// Error Component
export const ErrorDisplay = ({
    message = "Something went wrong",
    description = null,
    onRetry = null,
    type = "error"
}) => {
    const getIcon = () => {
        switch (type) {
            case "network":
                return <WifiIcon className="h-16 w-16 text-red-400" />;
            case "unauthorized":
                return <ExclamationTriangleIcon className="h-16 w-16 text-yellow-400" />;
            default:
                return <ExclamationTriangleIcon className="h-16 w-16 text-red-400" />;
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4">
                {getIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">{message}</h3>
            {description && (
                <p className="text-gray-500 text-sm mb-4 max-w-md">{description}</p>
            )}
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center space-x-2 bg-[#3c6e71] hover:bg-[#284b63] text-white px-4 py-2 rounded-lg transition duration-200"
                >
                    <ArrowPathIcon className="h-4 w-4" />
                    <span>Try Again</span>
                </button>
            )}
        </div>
    );
};

// Empty State Component (for lists/grids)
export const EmptyState = ({
    title = "Nothing here yet",
    description = "Get started by adding your first item.",
    actionButton = null,
    icon = "📋"
}) => {
    return (
        <div className="flex flex-col items-center justify-center p-16 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-md">{description}</p>
            {actionButton}
        </div>
    );
};

// Card Loading Skeleton
export const CardSkeleton = ({ count = 3 }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                </div>
            ))}
        </div>
    );
};

// Table Loading Skeleton
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="p-4 border-b animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
            {Array.from({ length: rows }).map((_, rowIndex) => (
                <div key={rowIndex} className="p-4 border-b animate-pulse">
                    <div className="grid grid-cols-4 gap-4">
                        {Array.from({ length: columns }).map((_, colIndex) => (
                            <div key={colIndex} className="h-3 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};