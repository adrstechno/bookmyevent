import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineBanner() {
	const { isConnected } = useNetworkStatus();
	const slideAnim = useRef(new Animated.Value(-100)).current;
	const wasOffline = useRef(false);

	useEffect(() => {
		if (!isConnected) {
			// Show banner when offline
			wasOffline.current = true;
			Animated.spring(slideAnim, {
				toValue: 0,
				useNativeDriver: true,
				tension: 65,
				friction: 8,
			}).start();
		} else if (wasOffline.current) {
			// Hide banner when back online
			Animated.timing(slideAnim, {
				toValue: -100,
				duration: 300,
				useNativeDriver: true,
			}).start(() => {
				wasOffline.current = false;
			});
		}
	}, [isConnected, slideAnim]);

	return (
		<Animated.View
			style={[
				styles.banner,
				{
					transform: [{ translateY: slideAnim }],
				},
			]}
			pointerEvents="none"
		>
			<View style={styles.content}>
				<Ionicons name="cloud-offline" size={18} color="#FFFFFF" />
				<ThemedText style={styles.text}>No Internet Connection</ThemedText>
			</View>
		</Animated.View>
	);
}

const styles = StyleSheet.create({
	banner: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		zIndex: 9999,
		backgroundColor: '#EF4444',
		paddingVertical: 10,
		paddingHorizontal: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	content: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	text: {
		color: '#FFFFFF',
		fontSize: 14,
		fontWeight: '600',
	},
});
