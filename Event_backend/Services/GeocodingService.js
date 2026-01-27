import axios from 'axios';

class GeocodingService {
    // Convert coordinates to address using OpenCage Geocoding API
    static async reverseGeocode(latitude, longitude) {
        try {
            // You can use different geocoding services:
            // 1. OpenCage (free tier: 2500 requests/day)
            // 2. Google Maps Geocoding API (paid)
            // 3. Nominatim (free, OpenStreetMap)
            
            // Using Nominatim (free) as default
            const response = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
                params: {
                    lat: latitude,
                    lon: longitude,
                    format: 'json',
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'GoEventify/1.0 (contact@goeventify.com)'
                }
            });

            if (response.data && response.data.display_name) {
                return {
                    success: true,
                    address: response.data.display_name,
                    details: {
                        house_number: response.data.address?.house_number,
                        road: response.data.address?.road,
                        suburb: response.data.address?.suburb,
                        city: response.data.address?.city || response.data.address?.town,
                        state: response.data.address?.state,
                        postcode: response.data.address?.postcode,
                        country: response.data.address?.country
                    }
                };
            } else {
                return {
                    success: false,
                    error: 'No address found for the given coordinates'
                };
            }
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            return {
                success: false,
                error: 'Failed to get address from coordinates'
            };
        }
    }

    // Convert address to coordinates (forward geocoding)
    static async geocode(address) {
        try {
            const response = await axios.get(`https://nominatim.openstreetmap.org/search`, {
                params: {
                    q: address,
                    format: 'json',
                    limit: 1,
                    addressdetails: 1
                },
                headers: {
                    'User-Agent': 'GoEventify/1.0 (contact@goeventify.com)'
                }
            });

            if (response.data && response.data.length > 0) {
                const result = response.data[0];
                return {
                    success: true,
                    latitude: parseFloat(result.lat),
                    longitude: parseFloat(result.lon),
                    address: result.display_name
                };
            } else {
                return {
                    success: false,
                    error: 'No coordinates found for the given address'
                };
            }
        } catch (error) {
            console.error('Geocoding error:', error);
            return {
                success: false,
                error: 'Failed to get coordinates from address'
            };
        }
    }

    // Get distance between two coordinates (in kilometers)
    static calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // Earth's radius in kilometers
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    static toRadians(degrees) {
        return degrees * (Math.PI/180);
    }
}

export default GeocodingService;