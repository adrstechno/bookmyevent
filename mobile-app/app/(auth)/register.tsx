import { Link } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

type SignupRole = 'user' | 'vendor';

export default function RegisterScreen() {
	const { register, isLoading, errorMessage, clearError } = useAuth();
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [role, setRole] = useState<SignupRole>('user');
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [localError, setLocalError] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			clearError();
		};
	}, [clearError]);

	const handleRegister = async () => {
		setLocalError(null);
		setSuccessMessage(null);

		if (!firstName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
			setLocalError('Please fill all required fields.');
			return;
		}

		if (password.length < 6) {
			setLocalError('Password must be at least 6 characters.');
			return;
		}

		if (password !== confirmPassword) {
			setLocalError('Passwords do not match.');
			return;
		}

		try {
			const result = await register({
				first_name: firstName.trim(),
				last_name: lastName.trim() || undefined,
				email: email.trim().toLowerCase(),
				phone: phone.trim(),
				password,
				user_type: role,
			});

			setSuccessMessage(result.message || 'Registration successful. Please check your email.');
		} catch {
			// Error state is managed by auth slice.
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Register</ThemedText>
			<ThemedText>Create a new account using the current backend APIs.</ThemedText>

			<TextInput
				style={styles.input}
				value={firstName}
				onChangeText={setFirstName}
				placeholder="First Name"
			/>
			<TextInput
				style={styles.input}
				value={lastName}
				onChangeText={setLastName}
				placeholder="Last Name (optional)"
			/>
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
				value={phone}
				onChangeText={setPhone}
				keyboardType="phone-pad"
				placeholder="Phone"
			/>
			<TextInput
				style={styles.input}
				value={password}
				onChangeText={setPassword}
				secureTextEntry
				placeholder="Password"
			/>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				placeholder="Confirm Password"
			/>

			<View style={styles.roleRow}>
				<Pressable
					style={[styles.roleButton, role === 'user' ? styles.roleButtonActive : undefined]}
					onPress={() => setRole('user')}
				>
					<ThemedText style={styles.roleText}>User</ThemedText>
				</Pressable>
				<Pressable
					style={[styles.roleButton, role === 'vendor' ? styles.roleButtonActive : undefined]}
					onPress={() => setRole('vendor')}
				>
					<ThemedText style={styles.roleText}>Vendor</ThemedText>
				</Pressable>
			</View>

			{(localError || errorMessage) && (
				<ThemedText style={styles.errorText}>{localError || errorMessage}</ThemedText>
			)}
			{successMessage && <ThemedText style={styles.successText}>{successMessage}</ThemedText>}

			<Pressable
				style={[styles.button, isLoading ? styles.buttonDisabled : undefined]}
				onPress={handleRegister}
				disabled={isLoading}
			>
				<ThemedText style={styles.buttonText}>{isLoading ? 'Creating...' : 'Create account'}</ThemedText>
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
	roleRow: {
		flexDirection: 'row',
		gap: 8,
	},
	roleButton: {
		flex: 1,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#D1D5DB',
		paddingVertical: 10,
		alignItems: 'center',
	},
	roleButtonActive: {
		backgroundColor: '#0A7EA4',
		borderColor: '#0A7EA4',
	},
	roleText: {
		fontWeight: '600',
	},
	errorText: {
		color: '#B42318',
	},
	successText: {
		color: '#027A48',
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

