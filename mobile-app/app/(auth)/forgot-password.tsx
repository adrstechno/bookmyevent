import { useState } from 'react';
import {
	Image,
	KeyboardAvoidingView,
	Platform,
	Pressable,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAppToast } from '@/components/common/AppToastProvider';
import { forgotPassword } from '@/services/auth/authApi';
import { useAppTheme } from '@/theme/useAppTheme';

export default function ForgotPasswordScreen() {
	const [email, setEmail] = useState('');
	const [emailSent, setEmailSent] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const { showError, showSuccess } = useAppToast();
	const { palette, isDark } = useAppTheme();

	const validate = () => {
		if (!email.trim()) { setError('Email is required'); return false; }
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) { setError('Enter a valid email address'); return false; }
		setError('');
		return true;
	};

	const onSubmit = async () => {
		if (!validate()) return;
		setLoading(true);
		try {
			const msg = await forgotPassword(email.trim().toLowerCase());
			setEmailSent(true);
			showSuccess(msg || 'Password reset link sent! Check your email.');
		} catch (err) {
			const fallback = 'Failed to send reset link. Please try again.';
			const msg =
				err && typeof err === 'object' && 'message' in err && typeof (err as { message?: unknown }).message === 'string'
					? (err as { message: string }).message
					: fallback;
			setError(msg);
			showError(msg);
		} finally {
			setLoading(false);
		}
	};

	const c = palette;

	return (
		<SafeAreaView style={[s.safe, { backgroundColor: c.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<ScrollView
					contentContainerStyle={s.scroll}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* ── Logo only ── */}
					<View style={s.logoWrap}>
						<Image
							source={require('@/assets/images/logo2.png')}
							style={s.logo}
							resizeMode="contain"
						/>
					</View>

					{/* ── Card ── */}
					<View style={[s.card, { backgroundColor: c.surfaceBg, borderColor: c.border }]}>

						{/* Heading */}
						<View style={s.cardHeader}>
							<Text style={[s.title, { color: c.text }]}>Forgot Password?</Text>
							<Text style={[s.subtitle, { color: c.subtext }]}>
								{emailSent
									? 'Check your email for reset instructions'
									: 'Enter your email to receive a password reset link'}
							</Text>
						</View>

						{!emailSent ? (
							<>
								{/* Email */}
								<View style={[s.inputRow, { borderColor: error ? c.danger : c.border, backgroundColor: c.surfaceBg }]}>
									<Feather name="mail" size={18} color={c.subtext} style={s.icon} />
									<TextInput
										style={[s.input, { color: c.text }]}
										value={email}
										onChangeText={(t) => { setEmail(t.replace(/\s/g, '')); setError(''); }}
										placeholder="Enter your email address"
										placeholderTextColor={c.muted}
										autoCapitalize="none"
										keyboardType="email-address"
										autoComplete="email"
									/>
								</View>
								{error ? <Text style={[s.errText, { color: c.danger }]}>{error}</Text> : null}

								{/* Submit */}
								<Pressable
									style={[s.btn, { backgroundColor: c.primary }, loading && s.btnDisabled]}
									onPress={onSubmit}
									disabled={loading}
								>
									<Text style={s.btnText}>{loading ? 'Sending...' : 'Send Reset Link'}</Text>
								</Pressable>

								{/* Back to Login */}
								<Pressable style={s.switchWrap} onPress={() => router.replace('/(auth)/login')}>
									<Text style={[s.switchText, { color: c.subtext }]}>
										Remember your password?{' '}
										<Text style={[s.switchLink, { color: c.primary }]}>Back to Login</Text>
									</Text>
								</Pressable>
							</>
						) : (
							<>
								{/* Success banner */}
								<View style={[s.successBanner, { backgroundColor: c.successSoft }]}>
									<Feather name="check-circle" size={22} color={c.success} />
									<View style={{ flex: 1, gap: 2 }}>
										<Text style={[s.successTitle, { color: c.success }]}>Email Sent!</Text>
										<Text style={[s.successBody, { color: c.subtext }]}>
											We've sent a reset link to{' '}
											<Text style={[s.successEmail, { color: c.text }]}>{email}</Text>
										</Text>
									</View>
								</View>

								{/* Next steps */}
								<View style={[s.stepsCard, { backgroundColor: c.elevatedBg }]}>
									<Text style={[s.stepsTitle, { color: c.text }]}>Next Steps:</Text>
									{[
										'Check your email inbox',
										'Click the password reset link',
										'Create a new password',
										'Login with your new password',
									].map((step, i) => (
										<View key={i} style={s.stepRow}>
											<Feather name="chevron-right" size={14} color={c.primary} />
											<Text style={[s.stepText, { color: c.subtext }]}>{step}</Text>
										</View>
									))}
									<Text style={[s.spamNote, { color: c.muted }]}>
										Didn't receive it? Check spam or{' '}
										<Text style={[s.tryAgain, { color: c.primary }]} onPress={() => setEmailSent(false)}>
											try again
										</Text>
									</Text>
								</View>

								{/* Back to Login */}
								<Pressable
									style={[s.outlineBtn, { borderColor: c.border, backgroundColor: c.elevatedBg }]}
									onPress={() => router.replace('/(auth)/login')}
								>
									<Text style={[s.outlineBtnText, { color: c.text }]}>Back to Login</Text>
								</Pressable>
							</>
						)}
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const s = StyleSheet.create({
	safe: { flex: 1 },
	scroll: { padding: 24, paddingBottom: 40 },

	logoWrap: { alignItems: 'center', marginBottom: 20, marginTop: 12 },
	logo: { width: 200, height: 80 },

	card: {
		borderRadius: 20,
		borderWidth: 1,
		padding: 24,
		gap: 16,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.08,
		shadowRadius: 12,
		elevation: 4,
	},

	cardHeader: { alignItems: 'center', gap: 4, marginBottom: 4 },
	title: { fontSize: 24, fontWeight: '800', textAlign: 'center' },
	subtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },

	inputRow: {
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 14,
		paddingHorizontal: 14,
		height: 52,
	},
	icon: { marginRight: 10 },
	input: { flex: 1, fontSize: 15, height: '100%' },

	errText: { fontSize: 12, fontWeight: '600', marginTop: -10 },

	btn: {
		borderRadius: 14,
		paddingVertical: 15,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.15,
		shadowRadius: 6,
		elevation: 3,
	},
	btnDisabled: { opacity: 0.55 },
	btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

	switchWrap: { alignItems: 'center', paddingTop: 2 },
	switchText: { fontSize: 14, textAlign: 'center' },
	switchLink: { fontWeight: '700' },

	successBanner: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		gap: 12,
		borderRadius: 12,
		padding: 14,
	},
	successTitle: { fontSize: 15, fontWeight: '700' },
	successBody: { fontSize: 13 },
	successEmail: { fontWeight: '700' },

	stepsCard: { borderRadius: 12, padding: 14, gap: 8 },
	stepsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
	stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	stepText: { fontSize: 13, flex: 1 },
	spamNote: { fontSize: 12, marginTop: 4 },
	tryAgain: { fontWeight: '700' },

	outlineBtn: {
		borderWidth: 1,
		borderRadius: 14,
		paddingVertical: 15,
		alignItems: 'center',
	},
	outlineBtnText: { fontSize: 16, fontWeight: '700' },
});
