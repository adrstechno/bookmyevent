import { Link, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/hooks/useAuth';

export default function VerifyEmailScreen() {
	const params = useLocalSearchParams<{ token?: string }>();
	const token = useMemo(() => {
		if (typeof params.token === 'string') {
			return params.token;
		}
		return '';
	}, [params.token]);

	const { confirmEmail, resendEmailVerification } = useAuth();
	const [isVerifying, setIsVerifying] = useState(true);
	const [message, setMessage] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [resendEmail, setResendEmail] = useState('');
	const [isResending, setIsResending] = useState(false);

	useEffect(() => {
		const runVerification = async () => {
			if (!token) {
				setError('Verification token is missing.');
				setIsVerifying(false);
				return;
			}

			try {
				const result = await confirmEmail(token);
				setMessage(result.message ?? 'Email verified successfully.');
				setError(null);
			} catch (err) {
				setError(typeof err === 'string' ? err : 'Email verification failed.');
			} finally {
				setIsVerifying(false);
			}
		};

		runVerification();
	}, [confirmEmail, token]);

	const onResend = async () => {
		setError(null);
		setMessage(null);

		if (!resendEmail.trim()) {
			setError('Enter your email to resend verification.');
			return;
		}

		setIsResending(true);
		try {
			const result = await resendEmailVerification(resendEmail.trim().toLowerCase());
			setMessage(result.message ?? 'Verification email resent successfully.');
		} catch (err) {
			setError(typeof err === 'string' ? err : 'Could not resend verification email.');
		} finally {
			setIsResending(false);
		}
	};

	return (
		<ThemedView style={styles.container}>
			<ThemedText type="title">Verify Email</ThemedText>
			<ThemedText>Confirm your account to continue using protected features.</ThemedText>

			{isVerifying ? <ThemedText>Verifying email token...</ThemedText> : null}
			{message && <ThemedText style={styles.successText}>{message}</ThemedText>}
			{error && <ThemedText style={styles.errorText}>{error}</ThemedText>}

			<TextInput
				style={styles.input}
				value={resendEmail}
				onChangeText={setResendEmail}
				autoCapitalize="none"
				keyboardType="email-address"
				placeholder="Email for resend"
			/>

			<Pressable
				style={[styles.button, isResending ? styles.buttonDisabled : undefined]}
				onPress={onResend}
				disabled={isResending}
			>
				<ThemedText style={styles.buttonText}>
					{isResending ? 'Resending...' : 'Resend verification email'}
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
