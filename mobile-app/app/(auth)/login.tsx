import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function LoginScreen() {
	const { login, isLoading, errorMessage, clearError } = useAuth();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [localError, setLocalError] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			clearError();
		};
	}, [clearError]);

	const handleLogin = async () => {
		setLocalError(null);

		if (!email.trim() || !password.trim()) {
			setLocalError('Email and password are required.');
			return;
		}

		try {
			await login({
				email: email.trim().toLowerCase(),
				password,
			});
		} catch {
			// Error state is managed by auth slice.
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Login</ThemedText>
			<ThemedText>Sign in using your existing GoEventify account.</ThemedText>

			<TextInput
				style={styles.input}
				value={email}
				onChangeText={setEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				placeholder="Email"
			/>

			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholder="Password"
			/>

			{(localError || errorMessage) && (
				<ThemedText style={styles.errorText}>{localError || errorMessage}</ThemedText>
			)}

			<Pressable
				style={[styles.button, isLoading ? styles.buttonDisabled : undefined]}
				onPress={handleLogin}
				disabled={isLoading}
			>
				<ThemedText style={styles.buttonText}>{isLoading ? 'Signing in...' : 'Sign in'}</ThemedText>
			</Pressable>

			<Link href="/(auth)/register" style={styles.linkText}>
				Create account
			</Link>

			<Link href="/(auth)/forgot-password" style={styles.linkText}>
				Forgot password?
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
	errorText: {
		color: '#B42318',
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
	linkText: {
		marginTop: 8,
		fontSize: 16,
	},
});

