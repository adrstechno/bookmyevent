import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export type NetworkStatus = {
	isConnected: boolean;
	isInternetReachable: boolean | null;
	type: string | null;
};

/**
 * Hook to monitor network connectivity status
 * Returns real-time network connection information
 */
export function useNetworkStatus(): NetworkStatus {
	const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
		isConnected: true, // Assume connected initially
		isInternetReachable: null,
		type: null,
	});

	useEffect(() => {
		// Get initial network state
		NetInfo.fetch().then((state: NetInfoState) => {
			setNetworkStatus({
				isConnected: state.isConnected ?? false,
				isInternetReachable: state.isInternetReachable ?? null,
				type: state.type,
			});
		});

		// Subscribe to network state updates
		const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
			setNetworkStatus({
				isConnected: state.isConnected ?? false,
				isInternetReachable: state.isInternetReachable ?? null,
				type: state.type,
			});
		});

		return () => {
			unsubscribe();
		};
	}, []);

	return networkStatus;
}

/**
 * Check if device is currently online
 */
export async function checkIsOnline(): Promise<boolean> {
	try {
		const state = await NetInfo.fetch();
		return state.isConnected ?? false;
	} catch (error) {
		console.error('[Network] Error checking online status:', error);
		return false;
	}
}
