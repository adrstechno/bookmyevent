import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { forgotPassword } from '@/services/auth/authApi';
import { useSettingsTheme } from '@/theme/settingsTheme';

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { showError, showSuccess } = useAppToast();
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';

	const onSubmit = async () => {
		setError('');
		setMessage('');

		if (!email.trim()) {
			setError('Please enter your email address.');
			return;
		}

		setLoading(true);
		try {
			const responseMessage = await forgotPassword(email.trim().toLowerCase());
			setMessage(responseMessage);
			showSuccess(responseMessage);
		} catch (err) {
			const fallback = 'Unable to send reset request. Please try again.';
			if (err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string') {
				const message = (err as { message: string }).message;
				setError(message);
				showError(message);
			} else {
				setError(fallback);
				showError(fallback);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<ScrollView contentContainerStyle={styles.container}>
				<ThemedText style={[styles.title, { color: palette.text }]}>Forgot Password</ThemedText>
				<ThemedText style={[styles.subtitle, { color: palette.subtext }]}>Enter your account email to receive reset instructions.</ThemedText>

				<View style={[styles.card, { backgroundColor: palette.surfaceBg, borderColor: palette.border }]}>
					<TextInput
						style={[styles.input, { color: palette.text, borderColor: palette.border, backgroundColor: palette.headerBtnBg }]}
						placeholder="Email"
						placeholderTextColor={palette.subtext}
						autoCapitalize="none"
						keyboardType="email-address"
						value={email}
						onChangeText={setEmail}
					/>

					{error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}
					{message ? <ThemedText style={[styles.messageText, { color: '#0F766E' }]}>{message}</ThemedText> : null}

					<Pressable style={[styles.primaryBtn, { backgroundColor: palette.tint }]} onPress={onSubmit} disabled={loading}>
						<ThemedText style={styles.primaryBtnText}>{loading ? 'Sending...' : 'Send Reset Link'}</ThemedText>
					</Pressable>

					<Pressable style={styles.linkBtn} onPress={() => router.replace('/(auth)/login')}>
						<ThemedText style={[styles.linkText, { color: palette.tint }]}>Back to Login</ThemedText>
					</Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	container: {
		padding: 16,
		gap: 10,
	},
	title: {
		fontSize: 25,
		fontWeight: '800',
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 20,
	},
	card: {
		borderWidth: 1,
		borderRadius: 14,
		padding: 14,
		gap: 10,
	},
	input: {
		height: 46,
		borderWidth: 1,
		borderRadius: 11,
		paddingHorizontal: 12,
		fontSize: 15,
	},
	primaryBtn: {
		height: 44,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryBtnText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFFFFF',
	},
	linkBtn: {
		alignItems: 'center',
		paddingVertical: 4,
	},
	linkText: {
		fontSize: 14,
		fontWeight: '700',
	},
	errorText: {
		fontSize: 12,
		fontWeight: '700',
		color: '#B91C1C',
	},
	messageText: {
		fontSize: 12,
		fontWeight: '700',
	},
});
