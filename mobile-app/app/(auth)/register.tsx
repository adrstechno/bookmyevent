import { useEffect, useState } from 'react';
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
import { useAppDispatch, useAppSelector } from '@/store';
import { clearAuthError, clearVerificationState, registerWithCredentials } from '@/store/slices/authSlice';
import { useAppTheme } from '@/theme/useAppTheme';

type FormErrors = {
	first_name?: string;
	email?: string;
	phone?: string;
	password?: string;
};

export default function RegisterScreen() {
	const dispatch = useAppDispatch();
	const router = useRouter();
	const { showSuccess, showError } = useAppToast();
	const { isLoading, error, requiresVerification, pendingVerificationEmail } = useAppSelector((s) => s.auth);
	const { palette, isDark } = useAppTheme();

	const [isVendorSignup, setIsVendorSignup] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [errors, setErrors] = useState<FormErrors>({});

	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [phone, setPhone] = useState('');
	const [password, setPassword] = useState('');

	useEffect(() => {
		dispatch(clearAuthError());
		setErrors({});
	}, [dispatch]);

	const clearErr = (key: keyof FormErrors) => setErrors((e) => ({ ...e, [key]: undefined }));

	const validate = (): boolean => {
		const err: FormErrors = {};
		if (!firstName.trim()) err.first_name = 'First name is required';
		if (!email.trim()) {
			err.email = 'Email is required';
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
			err.email = 'Enter a valid email address';
		}
		if (!phone.trim()) {
			err.phone = 'Phone number is required';
		} else if (!/^[6-9]\d{9}$/.test(phone.trim())) {
			err.phone = 'Enter a valid 10-digit phone number';
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
				registerWithCredentials({
					firstName: firstName.trim(),
					lastName: lastName.trim(),
					email: email.trim().toLowerCase(),
					password: password.trim(),
					phone: phone.trim(),
					userType: isVendorSignup ? 'vendor' : 'user',
				})
			).unwrap();
			showSuccess('Registration successful! Check your email.');
		} catch (err) {
			const message = typeof err === 'string' ? err : 'Registration failed. Please try again.';
			showError(message);
		}
	};

	const c = palette;

	// ── Registration success — show "check your email" ─────────
	if (requiresVerification && pendingVerificationEmail) {
		return (
			<SafeAreaView style={[s.safe, { backgroundColor: c.screenBg }]} edges={['top', 'bottom']}>
				<StatusBar style={isDark ? 'light' : 'dark'} />
				<ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
					<View style={s.logoWrap}>
						<Image source={require('@/assets/images/login_logo.png')} style={s.logo} resizeMode="contain" />
					</View>
					<View style={[s.card, { backgroundColor: c.surfaceBg, borderColor: c.border }]}> 
						<View style={[s.successBanner, { backgroundColor: c.successSoft }]}>
							<Feather name="check-circle" size={32} color={c.success} />
							<Text style={[s.successTitle, { color: c.text }]}>Registration Successful!</Text>
							<Text style={[s.successBody, { color: c.subtext }]}>
								We sent a verification link to{'\n'}
								<Text style={{ fontWeight: '700', color: c.text }}>{pendingVerificationEmail}</Text>
								{'\n\n'}Please check your inbox and click the link to activate your account before logging in.
							</Text>
						</View>

						<View style={[s.stepsCard, { backgroundColor: c.elevatedBg }]}>
							<Text style={[s.stepsTitle, { color: c.text }]}>Next Steps:</Text>
							{[
								'Check your email inbox',
								'Click the verification link',
								'Come back and login',
							].map((step, i) => (
								<View key={i} style={s.stepRow}>
									<Feather name="chevron-right" size={14} color={c.primary} />
									<Text style={[s.stepText, { color: c.subtext }]}>{step}</Text>
								</View>
							))}
						</View>

						<Pressable
							style={[s.btn, { backgroundColor: c.primary }]}
							onPress={() => {
								dispatch(clearVerificationState());
								router.replace('/(auth)/login');
							}}
						>
							<Text style={s.btnText}>Go to Login</Text>
						</Pressable>
					</View>
				</ScrollView>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={[s.safe, { backgroundColor: c.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
				<ScrollView
					contentContainerStyle={s.scroll}
					showsVerticalScrollIndicator={false}
					keyboardShouldPersistTaps="handled"
				>
					{/* Logo */}
				<View style={s.logoWrap}>
						<Image source={require('@/assets/images/mobile_logo.png')} style={s.logo} resizeMode="contain" />
					</View>

					{/* Card */}
					<View style={[s.card, { backgroundColor: c.surfaceBg, borderColor: c.border }]}>

						<View style={s.cardHeader}>
							<Text style={[s.title, { color: c.text }]}>
								{isVendorSignup ? 'Vendor Sign Up' : 'User Sign Up'}
							</Text>
							<Text style={[s.subtitle, { color: c.subtext }]}>
								{isVendorSignup
									? 'Join as a vendor and grow your business'
									: "Let's get you started with events"}
							</Text>
						</View>

						{/* First + Last Name */}
						<View style={s.nameRow}>
							<View style={s.nameCol}>
								<View style={[s.inputRow, { borderColor: errors.first_name ? c.danger : c.border, backgroundColor: c.surfaceBg, borderWidth: 1 }]}>
									<Feather name="user" size={20} color={c.subtext} style={s.icon} />
									<TextInput
										style={[s.input, { color: c.text }]}
										value={firstName}
										onChangeText={(t) => { setFirstName(t.replace(/[^a-zA-Z\s-]/g, '')); clearErr('first_name'); }}
										placeholder="First Name"
										placeholderTextColor={c.muted}
										maxLength={50}
									/>
								</View>
								{errors.first_name ? <Text style={[s.errText, { color: c.danger }]}>{errors.first_name}</Text> : null}
							</View>
							<View style={s.nameCol}>
								<View style={[s.inputRow, { borderColor: c.border, backgroundColor: c.surfaceBg }]}>
									<Feather name="user" size={20} color={c.subtext} style={s.icon} />
									<TextInput
										style={[s.input, { color: c.text }]}
										value={lastName}
										onChangeText={(t) => setLastName(t.replace(/[^a-zA-Z\s-]/g, ''))}
										placeholder="Last Name"
										placeholderTextColor={c.muted}
										maxLength={50}
									/>
								</View>
							</View>
						</View>

						{/* Email */}
						<View style={[s.inputRow, { borderColor: errors.email ? c.danger : c.border, backgroundColor: c.surfaceBg }]}>
							<Feather name="mail" size={20} color={c.subtext} style={s.icon} />
							<TextInput
								style={[s.input, { color: c.text }]}
								value={email}
								onChangeText={(t) => { setEmail(t.replace(/\s/g, '')); clearErr('email'); dispatch(clearAuthError()); }}
								placeholder="Email Address"
								placeholderTextColor={c.muted}
								autoCapitalize="none"
								keyboardType="email-address"
								autoComplete="email"
							/>
						</View>
						{errors.email ? <Text style={[s.errText, { color: c.danger }]}>{errors.email}</Text> : null}

						{/* Phone */}
						<View style={[s.inputRow, { borderColor: errors.phone ? c.danger : c.border, backgroundColor: c.surfaceBg }]}>
							<Feather name="phone" size={20} color={c.subtext} style={s.icon} />
							<TextInput
								style={[s.input, { color: c.text }]}
								value={phone}
								onChangeText={(t) => { setPhone(t.replace(/\D/g, '').slice(0, 10)); clearErr('phone'); }}
								placeholder="Phone Number (10 digits)"
								placeholderTextColor={c.muted}
								keyboardType="phone-pad"
								maxLength={10}
							/>
						</View>
						{errors.phone ? (
							<Text style={[s.errText, { color: c.danger }]}>{errors.phone}</Text>
						) : phone.length > 0 && phone.length < 10 ? (
							<Text style={[s.hintText, { color: c.warning }]}>{10 - phone.length} digits remaining</Text>
						) : null}

						{/* Password */}
						<View style={[s.inputRow, { borderColor: errors.password ? c.danger : c.border, backgroundColor: c.surfaceBg }]}>
							<Feather name="lock" size={20} color={c.subtext} style={s.icon} />
							<TextInput
								style={[s.input, { color: c.text, flex: 1 }]}
								value={password}
								onChangeText={(t) => { setPassword(t); clearErr('password'); }}
								placeholder="Password"
								placeholderTextColor={c.muted}
								secureTextEntry={!showPassword}
							/>
							<Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10} style={s.eyeBtn}>
								<Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color={c.subtext} />
							</Pressable>
						</View>
						{errors.password ? (
							<Text style={[s.errText, { color: c.danger }]}>{errors.password}</Text>
						) : password.length > 0 && password.length < 6 ? (
							<Text style={[s.hintText, { color: c.warning }]}>
								Password strength: {password.length < 3 ? 'Weak' : 'Fair'}
							</Text>
						) : null}

						{/* API error */}
				{/* Backend errors are shown via toast, so avoid duplicate inline messages. */}
						{/* Submit */}
						<Pressable
							style={[s.btn, { backgroundColor: c.primary }, isLoading && s.btnDisabled]}
							onPress={onSubmit}
							disabled={isLoading}
						>
							<Text style={s.btnText}>
								{isLoading
									? 'Registering...'
									: isVendorSignup
									? 'Register as Vendor'
									: 'Register as User'}
							</Text>
						</Pressable>

						{/* Vendor / User toggle */}
						<Pressable
							style={[s.toggleBtn, { backgroundColor: c.elevatedBg }]}
							onPress={() => setIsVendorSignup((v) => !v)}
						>
							<Text style={[s.toggleText, { color: c.subtext }]}>
								{isVendorSignup ? 'Want a normal account? ' : 'Want to offer services? '}
								<Text style={[s.toggleLink, { color: c.primary }]}>
									{isVendorSignup ? 'Sign Up as User' : 'Sign Up as Vendor'}
								</Text>
							</Text>
						</Pressable>

						{/* Login link */}
						<Pressable style={s.switchWrap} onPress={() => router.replace('/(auth)/login')}>
							<Text style={[s.switchText, { color: c.subtext }]}>
								Already have an account?{' '}
								<Text style={[s.switchLink, { color: c.primary }]}>Login</Text>
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

	logoWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 12,
		marginTop: 12,
		width: 200,
		height: 120,
		borderRadius: 18,
		backgroundColor: 'transparent',
		borderWidth: 0,
	},
	logo: {
		width: '100%',
		height: '100%',
		borderRadius: 18,
		backgroundColor: 'transparent',
	},

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
	subtitle: { fontSize: 14, textAlign: 'center' },

	nameRow: { flexDirection: 'row', gap: 10 },
	nameCol: { flex: 1, gap: 4 },

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
	hintText: { fontSize: 11, marginTop: -10 },

	errorBox: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 8,
		borderRadius: 10,
		padding: 12,
		marginTop: -6,
	},

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

	toggleBtn: {
		borderRadius: 12,
		paddingVertical: 14,
		paddingHorizontal: 16,
		alignItems: 'center',
	},
	toggleText: { fontSize: 13, textAlign: 'center' },
	toggleLink: { fontWeight: '700' },

	switchWrap: { alignItems: 'center', paddingTop: 2 },
	switchText: { fontSize: 14, textAlign: 'center' },
	switchLink: { fontWeight: '700' },

	// Success state
	successBanner: {
		borderRadius: 14,
		padding: 20,
		alignItems: 'center',
		gap: 12,
	},
	successTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
	successBody: { fontSize: 14, textAlign: 'center', lineHeight: 22 },

	stepsCard: { borderRadius: 12, padding: 14, gap: 8 },
	stepsTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
	stepRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
	stepText: { fontSize: 13, flex: 1 },
});
