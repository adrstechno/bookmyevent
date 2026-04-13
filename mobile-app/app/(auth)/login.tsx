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
import { Redirect, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';

import { useAppToast } from '@/components/common/AppToastProvider';
import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuthError, loginWithCredentials } from '@/store/slices/authSlice';
import { useAppTheme } from '@/theme/useAppTheme';
import { getRoleHomeRoute } from '@/utils/authRole';

export default function LoginScreen() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { showError, showSuccess } = useAppToast();
	const {
		isAuthenticated,
		isHydrated,
		isLoading,
		error,
		role: authRole,
		requiresVerification,
		pendingVerificationEmail,
	} = useAppSelector((s) => s.auth);
	const { palette, isDark } = useAppTheme();

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

	if (isHydrated && isAuthenticated) {
		return <Redirect href={getRoleHomeRoute(authRole)} />;
	}

	const validate = () => {
		const err: { email?: string; password?: string } = {};
		if (!email.trim()) {
			err.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			err.email = 'Enter a valid email';
		}
		if (!password.trim()) {
			err.password = 'Password is required';
		} else if (password.trim().length < 6) {
			err.password = 'Password must be at least 6 characters';
		}
		setErrors(err);
		return Object.keys(err).length === 0;
	};

	const onSubmit = async () => {
		dispatch(clearAuthError());
		if (!validate()) return;
		try {
			await dispatch(
				loginWithCredentials({
					email: email.trim().toLowerCase(),
					password: password.trim(),
				})
			).unwrap();
			showSuccess('Login Successful');
		} catch {
			// error is shown from redux state
		}
	};

	const c = palette;

	// ── Email not verified banner ──────────────────────────────
	if (requiresVerification && pendingVerificationEmail) {
		return (
			<SafeAreaView style={[s.safe, { backgroundColor: c.screenBg }]} edges={['top', 'bottom']}>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				<ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
					<View style={s.logoWrap}>
						<Image source={require('@/assets/images/logo2.png')} style={s.logo} resizeMode="contain" />
					</View>
					<View style={[s.card, { backgroundColor: c.surfaceBg, borderColor: c.border }]}>
						<View style={[s.verifyBanner, { backgroundColor: c.warningSoft }]}>
							<Feather name="mail" size={28} color={c.warning} />
							<Text style={[s.verifyTitle, { color: c.text }]}>Verify Your Email</Text>
							<Text style={[s.verifyBody, { color: c.subtext }]}>
								We sent a verification link to{'\n'}
								<Text style={{ fontWeight: '700', color: c.text }}>{pendingVerificationEmail}</Text>
								{'\n\n'}Please check your inbox and click the link to activate your account.
							</Text>
						</View>
						<Pressable
							style={[s.btn, { backgroundColor: c.primary }]}
							onPress={() => dispatch(clearAuthError())}
						>
							<Text style={s.btnText}>Back to Login</Text>
						</Pressable>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[s.safe, { backgroundColor: c.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
				<ScrollView
					contentContainerStyle={s.scroll}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* Logo */}
					<View style={s.logoWrap}>
						<Image source={require('@/assets/images/logo2.png')} style={s.logo} resizeMode="contain" />
					</View>

					{/* Card */}
					<View style={[s.card, { backgroundColor: c.surfaceBg, borderColor: c.border }]}>

						<View style={s.cardHeader}>
							<Text style={[s.title, { color: c.text }]}>Welcome Back</Text>
							<Text style={[s.subtitle, { color: c.subtext }]}>Login to continue your journey</Text>
						</View>

						{/* Email */}
						<View style={[s.inputRow, { borderColor: errors.email ? c.danger : c.border, backgroundColor: c.surfaceBg }]}>
							<Feather name="mail" size={18} color={c.subtext} style={s.icon} />
							<TextInput
								style={[s.input, { color: c.text }]}
								value={email}
								onChangeText={(t) => { setEmail(t.replace(/\s/g, '')); setErrors((e) => ({ ...e, email: undefined })); dispatch(clearAuthError()); }}
								placeholder="Email Address"
								placeholderTextColor={c.muted}
								autoCapitalize="none"
								keyboardType="email-address"
								autoComplete="email"
							/>
						</View>
						{errors.email ? <Text style={[s.errText, { color: c.danger }]}>{errors.email}</Text> : null}

						{/* Password */}
						<View style={[s.inputRow, { borderColor: errors.password ? c.danger : c.border, backgroundColor: c.surfaceBg }]}>
							<Feather name="lock" size={18} color={c.subtext} style={s.icon} />
							<TextInput
								style={[s.input, { color: c.text, flex: 1 }]}
								value={password}
								onChangeText={(t) => { setPassword(t); setErrors((e) => ({ ...e, password: undefined })); dispatch(clearAuthError()); }}
								placeholder="Password"
								placeholderTextColor={c.muted}
								secureTextEntry={!showPassword}
							/>
							<Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10} style={s.eyeBtn}>
								<Feather name={showPassword ? 'eye-off' : 'eye'} size={18} color={c.subtext} />
							</Pressable>
						</View>
						{errors.password ? <Text style={[s.errText, { color: c.danger }]}>{errors.password}</Text> : null}

						{/* Forgot Password */}
						<Pressable style={s.forgotWrap} onPress={() => router.push('/(auth)/forgot-password')}>
							<Text style={[s.forgotText, { color: c.primary }]}>Forgot Password?</Text>
						</Pressable>

						{/* API error */}
						{error ? (
							<View style={[s.errorBox, { backgroundColor: c.dangerSoft }]}>
								<Feather name="alert-circle" size={15} color={c.danger} />
								<Text style={[s.errText, { color: c.danger, marginTop: 0, flex: 1 }]}>{error}</Text>
							</View>
						) : null}

						{/* Submit */}
						<Pressable
							style={[s.btn, { backgroundColor: c.primary }, isLoading && s.btnDisabled]}
							onPress={onSubmit}
							disabled={isLoading}
						>
							<Text style={s.btnText}>{isLoading ? 'Processing...' : 'Login'}</Text>
						</Pressable>

						{/* Register link */}
						<Pressable style={s.switchWrap} onPress={() => router.push('/(auth)/register')}>
							<Text style={[s.switchText, { color: c.subtext }]}>
								Don't have an account?{' '}
								<Text style={[s.switchLink, { color: c.primary }]}>Register</Text>
							</Text>
						</Pressable>

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
	title: { fontSize: 26, fontWeight: '800', textAlign: 'center' },
	subtitle: { fontSize: 14, textAlign: 'center' },

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
	eyeBtn: { padding: 4 },

	errText: { fontSize: 12, fontWeight: '600', marginTop: -10 },

	errorBox: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderRadius: 10,
		padding: 12,
		marginTop: -6,
	},

	forgotWrap: { alignSelf: 'flex-end', marginTop: -6 },
	forgotText: { fontSize: 13, fontWeight: '700' },

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

	// Verification banner
	verifyBanner: {
		borderRadius: 14,
		padding: 20,
		alignItems: 'center',
		gap: 12,
	},
	verifyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
	verifyBody: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
