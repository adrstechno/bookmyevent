import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function ResetPasswordScreen() {
	const params = useLocalSearchParams<{ token?: string }>();
	const token = useMemo(() => {
		if (typeof params.token === 'string') {
			return params.token;
		}
		return '';
	}, [params.token]);

	const { checkResetToken, submitPasswordReset } = useAuth();
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isTokenValidating, setIsTokenValidating] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);

	useEffect(() => {
		const validate = async () => {
			if (!token) {
				setError('Reset token is missing.');
				setIsTokenValidating(false);
				return;
			}

			try {
				await checkResetToken(token);
				setError(null);
			} catch (err) {
				setError(typeof err === 'string' ? err : 'Reset token is invalid or expired.');
			} finally {
				setIsTokenValidating(false);
			}
		};

		validate();
	}, [checkResetToken, token]);

	const onSubmit = async () => {
		setError(null);
		setMessage(null);

		if (!token) {
			setError('Reset token is missing.');
			return;
		}

		if (!newPassword || !confirmPassword) {
			setError('Please fill all fields.');
			return;
		}

		if (newPassword.length < 6) {
			setError('Password must be at least 6 characters.');
			return;
		}

		if (newPassword !== confirmPassword) {
			setError('Passwords do not match.');
			return;
		}

		setIsSubmitting(true);
		try {
			const response = await submitPasswordReset({
				token,
				newPassword,
				confirmPassword,
			});
			setMessage(response.message ?? 'Password reset successful.');
		} catch (err) {
			setError(typeof err === 'string' ? err : 'Could not reset password.');
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Reset Password</ThemedText>
			<ThemedText>Set a new password for your account.</ThemedText>

			{isTokenValidating ? <ThemedText>Validating reset link...</ThemedText> : null}
			{error && <ThemedText style={styles.errorText}>{error}</ThemedText>}
			{message && <ThemedText style={styles.successText}>{message}</ThemedText>}

			<TextInput
				style={styles.input}
				value={newPassword}
				onChangeText={setNewPassword}
				secureTextEntry
				placeholder="New Password"
				editable={!isTokenValidating && !Boolean(error)}
			/>
			<TextInput
				style={styles.input}
				value={confirmPassword}
				onChangeText={setConfirmPassword}
				secureTextEntry
				placeholder="Confirm Password"
				editable={!isTokenValidating && !Boolean(error)}
			/>

			<Pressable
				style={[
					styles.button,
					(isSubmitting || isTokenValidating || Boolean(error)) ? styles.buttonDisabled : undefined,
				]}
				onPress={onSubmit}
				disabled={isSubmitting || isTokenValidating || Boolean(error)}
			>
				<ThemedText style={styles.buttonText}>
					{isSubmitting ? 'Updating...' : 'Update password'}
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
