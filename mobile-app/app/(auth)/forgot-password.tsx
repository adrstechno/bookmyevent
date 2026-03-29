import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function ForgotPasswordScreen() {
	const { forgotPassword } = useAuth();
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const onSubmit = async () => {
		setError(null);
		setMessage(null);

		if (!email.trim()) {
			setError('Email is required.');
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await forgotPassword(email.trim().toLowerCase());
			setMessage(response.message ?? 'If an account exists, reset instructions will be sent.');
		} catch (err) {
			setError(typeof err === 'string' ? err : 'Could not send reset email.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Forgot Password</ThemedText>
			<ThemedText>Enter your account email to request a password reset link.</ThemedText>

			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				placeholder="Email"
			/>

			{error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
			{message && <ThemedText style={styles.successText}>{message}</ThemedText>}

			<Pressable
				style={[styles.button, isSubmitting ? styles.buttonDisabled : undefined]}
				onPress={onSubmit}
				disabled={isSubmitting}
			>
				<ThemedText style={styles.buttonText}>
					{isSubmitting ? 'Sending...' : 'Send reset link'}
				</ThemedText>
			</Pressable>

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
	input: {
		borderWidth: 1,
		borderColor: '#D1D5DB',
		borderRadius: 10,
		paddingHorizontal: 12,
		paddingVertical: 10,
		fontSize: 16,
		backgroundColor: '#FFFFFF',
	},
	button: {
		marginTop: 8,
		backgroundColor: '#0A7EA4',
		borderRadius: 10,
		paddingVertical: 12,
		alignItems: 'center',
	},
	buttonDisabled: {
		opacity: 0.6,
	},
	buttonText: {
		color: '#FFFFFF',
		fontWeight: '600',
	},
	errorText: {
		color: '#B42318',
	},
	successText: {
		color: '#027A48',
	},
	linkText: {
		marginTop: 8,
		fontSize: 16,
	},
});
