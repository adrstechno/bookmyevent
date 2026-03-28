import { Link } from 'expo-router';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
	const { loginWithToken } = useAuth();

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Login</ThemedText>
			<ThemedText>Session bootstrap is now wired with centralized API auth token setup.</ThemedText>

			<Pressable style={styles.button} onPress={() => loginWithToken('demo-access-token')}>
				<ThemedText style={styles.buttonText}>Continue (Demo Login)</ThemedText>
			</Pressable>

			<Link href="/(auth)/register" style={styles.linkText}>
				Create account
			</Link>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		padding: 20,
		gap: 12,
	},
	button: {
		marginTop: 8,
		backgroundColor: '#0A7EA4',
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: 'center',
	},
	buttonText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	linkText: {
		marginTop: 8,
		fontSize: 16,
	},
});

