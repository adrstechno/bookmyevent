import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function RegisterScreen() {
	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Register</ThemedText>
			<ThemedText>Signup UI will be connected to backend APIs in the next step.</ThemedText>
			<Link href="/(auth)/login" style={styles.linkText}>
				Back to login
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
	linkText: {
		marginTop: 8,
		fontSize: 16,
	},
});

