# Frontend Error Handling Guide

This guide shows how to implement consistent error handling across the frontend using our custom utilities.

## Quick Start

### 1. Import the utilities
```jsx
import { useApiCall } from '../hooks/useApiCall';
import { LoadingSpinner, NoDataFound, ErrorDisplay, CardSkeleton } from '../components/common/StateComponents';
import { ERROR_TYPES } from '../utils/errorHandler';
```

### 2. Use the custom hook
```jsx
const MyComponent = () => {
  const {
    data,
    loading,
    error,
    execute: fetchData,
    isLoading,
    isEmpty,
    isError
  } = useApiCall([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    await fetchData(
      () => axios.get('/api/endpoint'),
      {
        emptyMessage: "No items found",
        showEmptyToast: false
      }
    );
  };

  // Render based on state
  if (isLoading) return <CardSkeleton count={3} />;
  if (isError) return <ErrorDisplay message={error.message} onRetry={loadData} />;
  if (isEmpty) return <NoDataFound message="No data available" />;

  return (
    <div>
      {data.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  );
};
```

## Error Types

- `NETWORK` - Connection issues
- `NO_DATA` - Empty response
- `UNAUTHORIZED` - 401 errors
- `FORBIDDEN` - 403 errors
- `NOT_FOUND` - 404 errors
- `SERVER_ERROR` - 5xx errors
- `VALIDATION` - 400 errors
- `UNKNOWN` - Other errors

## State Components

### LoadingSpinner
```jsx
<LoadingSpinner message="Loading data..." size="lg" />
```

### NoDataFound
```jsx
<NoDataFound 
  message="No vendors found"
  description="Try adjusting your filters"
  icon={<div className="text-6xl">🔍</div>}
  actionButton={<button onClick={retry}>Retry</button>}
/>
```

### ErrorDisplay
```jsx
<ErrorDisplay 
  message="Failed to load data"
  description="Please check your connection"
  onRetry={retryFunction}
  type="network"
/>
```

### CardSkeleton
```jsx
<CardSkeleton count={6} />
```

## Best Practices

1. **Always handle empty states** - Show meaningful messages when no data is found
2. **Provide retry options** - Let users retry failed operations
3. **Use appropriate loading states** - Skeletons for content, spinners for actions
4. **Show specific error messages** - Help users understand what went wrong
5. **Handle network errors gracefully** - Detect offline/connection issues

## Migration Example

### Before (Old way)
```jsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    const response = await axios.get('/api/data');
    setData(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

if (loading) return <div>Loading...</div>;
if (error) return <div>Error: {error}</div>;
if (data.length === 0) return <div>No data</div>;
```

### After (New way)
```jsx
const {
  data,
  isLoading,
  isError,
  isEmpty,
  error,
  execute: fetchData
} = useApiCall([]);

const loadData = async () => {
  await fetchData(() => axios.get('/api/data'));
};

if (isLoading) return <CardSkeleton count={3} />;
if (isError) return <ErrorDisplay message={error.message} onRetry={loadData} />;
if (isEmpty) return <NoDataFound message="No data available" />;
```

## Components to Update

Priority order for updating components:
1. ✅ VendorsByService.jsx - Updated
2. ✅ ServiceSection.jsx - Updated  
3. VendorDashboard.jsx - Partially updated
4. VendorSettings.jsx
5. AdminUsers.jsx
6. MyPackege.jsx
7. VendorGallery.jsx
8. BookingSection.jsx

Each component should follow the same pattern for consistent user experience.