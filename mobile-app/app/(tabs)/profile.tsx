import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileTabScreen() {
	const { logout } = useAuth();

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Profile</ThemedText>
			<ThemedText>Authentication state is now centralized and persistent.</ThemedText>
			<Pressable style={styles.button} onPress={logout}>
				<ThemedText style={styles.buttonText}>Logout</ThemedText>
			</Pressable>
		</ThemedView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		padding: 20,
		gap: 10,
	},
	button: {
		marginTop: 8,
		backgroundColor: '#0A7EA4',
		borderRadius: 10,
		paddingVertical: 10,
		paddingHorizontal: 16,
	},
	buttonText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
});

