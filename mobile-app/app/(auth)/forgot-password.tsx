import { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
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
				<Image source={require('@/assets/images/home/logo2.png')} style={styles.brandLogo} resizeMode="contain" />
				<View style={styles.logoPill}>
					<ThemedText style={[styles.logoPillText, { color: palette.primary }]}>GOEVENTIFY</ThemedText>
				</View>
				<ThemedText style={[styles.brand, { color: palette.text }]}>GoEventify</ThemedText>
				<ThemedText style={[styles.title, { color: palette.text }]}>Forgot Password</ThemedText>
				<ThemedText style={[styles.subtitle, { color: palette.subtext }]}>Enter your account email to receive password reset instructions.</ThemedText>

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

					{error ? <ThemedText style={[styles.errorText, { color: palette.danger }]}>{error}</ThemedText> : null}
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
		padding: 20,
		gap: 12,
		paddingBottom: 36,
	},
	brandLogo: {
		width: 170,
		height: 64,
		alignSelf: 'flex-start',
	},
	logoPill: {
		alignSelf: 'flex-start',
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 4,
		backgroundColor: '#FDE7EF',
	},
	logoPillText: {
		fontSize: 11,
		letterSpacing: 1,
		fontWeight: '800',
	},
	brand: {
		fontSize: 20,
		fontWeight: '900',
		letterSpacing: 0.2,
	},
	title: {
		fontSize: 30,
		fontWeight: '800',
		lineHeight: 34,
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 21,
	},
	card: {
		borderWidth: 1,
		borderRadius: 16,
		padding: 14,
		gap: 12,
	},
	input: {
		height: 48,
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
	},
	messageText: {
		fontSize: 12,
		fontWeight: '700',
	},
});
