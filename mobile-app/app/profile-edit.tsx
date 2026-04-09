import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, BackHandler, Pressable, ScrollView, StyleSheet, TextInput, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { changePassword, validateToken } from '@/services/auth/authApi';
import { ThemedText } from '@/components/themed-text';
import { useAppSelector } from '@/store';
import { useSettingsTheme } from '@/theme/settingsTheme';

type EditProfileForm = {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
};

type ChangePasswordForm = {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
};

export default function ProfileEditScreen() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const { isAuthenticated, isHydrated } = useAppSelector((state) => state.auth);
	const authName = useAppSelector((state) => state.auth.name);
	const authEmail = useAppSelector((state) => state.auth.email);
	const { mode, palette } = useSettingsTheme();
	const isDark = mode === 'dark';
	const { height: screenHeight } = useWindowDimensions();
	const params = useLocalSearchParams<EditProfileForm>();
	const [form, setForm] = useState<EditProfileForm>({
		firstName: params.firstName ?? (authName || 'Guest').split(' ')[0] ?? 'Guest',
		lastName: params.lastName ?? (authName || '').split(' ').slice(1).join(' '),
		email: params.email ?? authEmail ?? 'guest@example.com',
		phone: params.phone ?? '',
	});
	const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});
	const [profileMessage, setProfileMessage] = useState('');
	const [passwordMessage, setPasswordMessage] = useState('');
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const headerAnim = useRef(new Animated.Value(0)).current;
	const cardAnim = useRef(new Animated.Value(0)).current;

	useEffect(() => {
		Animated.parallel([
			Animated.timing(headerAnim, {
				toValue: 1,
				duration: 280,
				useNativeDriver: true,
			}),
			Animated.timing(cardAnim, {
				toValue: 1,
				duration: 420,
				delay: 90,
				useNativeDriver: true,
			}),
		]).start();
	}, [cardAnim, headerAnim]);

	useEffect(() => {
		const hydrateForm = async () => {
			try {
				const user = await validateToken();
				setForm((prev) => ({
					...prev,
					firstName: user.firstName || prev.firstName,
					lastName: user.lastName || prev.lastName,
					email: user.email || prev.email,
				}));
			} catch {
				// Keep current values when profile endpoint is unavailable.
			}
		};

		void hydrateForm();
	}, []);

	useEffect(() => {
		const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
			router.replace('/(tabs)/profile');
			return true;
		});

		return () => subscription.remove();
	}, [router]);

	const goBack = () => {
		router.replace('/(tabs)/profile');
	};

	const isValidEmail = (value: string) => {
		return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
	};

	const isValidPhone = (value: string) => {
		const digitsOnly = value.replace(/\D/g, '');
		return digitsOnly.length === 10;
	};

	const onSave = () => {
		void (async () => {
			const payload = {
				firstName: form.firstName.trim(),
				lastName: form.lastName.trim(),
				email: form.email.trim().toLowerCase(),
				phone: form.phone.trim(),
			};

			if (!payload.firstName || !payload.lastName || !payload.email || !payload.phone) {
				setProfileMessage('Please fill all profile fields.');
				return;
			}

			if (!isValidEmail(payload.email)) {
				setProfileMessage('Please enter a valid email address.');
				return;
			}

			if (!isValidPhone(payload.phone)) {
				setProfileMessage('Please enter a valid 10-digit phone number.');
				return;
			}

			setIsSavingProfile(true);
			setProfileMessage('');
			setProfileMessage('Profile update API is not available yet. This form is validated and ready for backend wiring.');
			setIsSavingProfile(false);
		})();
	};

	const onChangePassword = () => {
		void (async () => {
			const currentPassword = passwordForm.currentPassword.trim();
			const newPassword = passwordForm.newPassword.trim();
			const confirmPassword = passwordForm.confirmPassword.trim();

			if (!currentPassword || !newPassword || !confirmPassword) {
				setPasswordMessage('Please fill all password fields.');
				return;
			}

			if (newPassword.length < 6) {
				setPasswordMessage('New password must be at least 6 characters.');
				return;
			}

			if (newPassword !== confirmPassword) {
				setPasswordMessage('New password and confirm password must match.');
				return;
			}

			setIsChangingPassword(true);
			setPasswordMessage('');
			try {
				const message = await changePassword({
					email: form.email.trim().toLowerCase(),
					oldPassword: currentPassword,
					newPassword,
				});
				setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
				setPasswordMessage(message || 'Password changed successfully.');
			} catch {
				setPasswordMessage('Unable to change password. Please try again.');
			} finally {
				setIsChangingPassword(false);
			}
		})();
	};

	if (isHydrated && !isAuthenticated) {
		return <Redirect href="/(auth)/login" />;
	}

	return (
		<SafeAreaView style={[styles.safeArea, { backgroundColor: palette.screenBg }]} edges={['top', 'bottom']}>
			<StatusBar style={isDark ? 'light' : 'dark'} />
			<Animated.View
				style={[
					styles.header,
					{ backgroundColor: palette.surfaceBg, borderBottomColor: palette.border },
					{
						opacity: headerAnim,
						transform: [
							{
								translateY: headerAnim.interpolate({
									inputRange: [0, 1],
									outputRange: [-14, 0],
								}),
							},
						],
					},
				]}
			>
				<AppTopBar title={isEditMode ? 'Edit Profile' : 'Profile Details'} onBackPress={goBack} />
			</Animated.View>

			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
			>
				<Animated.View
					style={[
						styles.card,
						{ backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.tint },
						{ minHeight: Math.max(screenHeight * 0.5, 360) },
						{
							opacity: cardAnim,
							transform: [
								{
									translateY: cardAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [20, 0],
									}),
								},
							],
						},
					]}
				>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Profile Information</ThemedText>

					{isEditMode ? (
						<>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.firstName}
								onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
								placeholder="First Name"
								placeholderTextColor={palette.subtext}
							/>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.lastName}
								onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
								placeholder="Last Name"
								placeholderTextColor={palette.subtext}
							/>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.email}
								onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
								placeholder="Email"
								placeholderTextColor={palette.subtext}
								keyboardType="email-address"
							/>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.phone}
								onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
								placeholder="Phone"
								placeholderTextColor={palette.subtext}
								keyboardType="phone-pad"
							/>

							<Pressable
								style={({ pressed }) => [
									styles.saveBtn,
									{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
									isSavingProfile ? styles.saveBtnDisabled : null,
									pressed ? styles.btnPressed : null,
								]}
								onPress={onSave}
								disabled={isSavingProfile}
							>
								<ThemedText style={styles.saveBtnText}>{isSavingProfile ? 'Saving...' : 'Save Profile'}</ThemedText>
							</Pressable>

							<Pressable
								style={({ pressed }) => [
									styles.secondaryBtn,
									{ backgroundColor: palette.elevatedBg, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
									pressed ? styles.btnPressed : null,
								]}
								onPress={() => {
									setIsEditMode(false);
									setProfileMessage('');
								}}
							>
								<ThemedText style={[styles.secondaryBtnText, { color: palette.primaryStrong }]}>Cancel</ThemedText>
							</Pressable>
						</>
					) : (
						<>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}> 
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>First Name</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>{form.firstName}</ThemedText>
							</View>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}> 
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Last Name</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>{form.lastName}</ThemedText>
							</View>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}> 
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Email</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>{form.email}</ThemedText>
							</View>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}> 
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Phone</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>{form.phone}</ThemedText>
							</View>
							<Pressable
								style={({ pressed }) => [
									styles.saveBtn,
									{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
									pressed ? styles.btnPressed : null,
								]}
								onPress={() => setIsEditMode(true)}
							>
								<ThemedText style={styles.saveBtnText}>Edit Profile</ThemedText>
							</Pressable>
						</>
					)}

					{profileMessage ? <ThemedText style={[styles.messageText, { color: palette.tint }]}>{profileMessage}</ThemedText> : null}
				</Animated.View>

				{isEditMode ? (
					<Animated.View
						style={[
							styles.card,
							{ backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.tint },
							{
								opacity: cardAnim,
								transform: [
									{
										translateY: cardAnim.interpolate({
											inputRange: [0, 1],
											outputRange: [20, 0],
										}),
									},
								],
							},
						]}
					>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Change Password</ThemedText>
					<ThemedText style={[styles.helperText, { color: palette.subtext }]}>Use your current password and set a new secure password.</ThemedText>

					<TextInput
						style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
						value={passwordForm.currentPassword}
						onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
						placeholder="Current Password"
						placeholderTextColor={palette.subtext}
						secureTextEntry
					/>
					<TextInput
						style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
						value={passwordForm.newPassword}
						onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
						placeholder="New Password"
						placeholderTextColor={palette.subtext}
						secureTextEntry
					/>
					<TextInput
						style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
						value={passwordForm.confirmPassword}
						onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, confirmPassword: value }))}
						placeholder="Confirm New Password"
						placeholderTextColor={palette.subtext}
						secureTextEntry
					/>

					<Pressable
						style={({ pressed }) => [
							styles.secondaryBtn,
							{ backgroundColor: palette.elevatedBg, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
							isChangingPassword ? styles.saveBtnDisabled : null,
							pressed ? styles.btnPressed : null,
						]}
						onPress={onChangePassword}
						disabled={isChangingPassword}
					>
						<ThemedText style={[styles.secondaryBtnText, { color: palette.primaryStrong }]}>{isChangingPassword ? 'Updating...' : 'Update Password'}</ThemedText>
					</Pressable>

					{passwordMessage ? <ThemedText style={[styles.messageText, { color: palette.tint }]}>{passwordMessage}</ThemedText> : null}
					</Animated.View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#F3F7F6',
	},
	header: {
		borderBottomWidth: 1,
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
	},
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 20,
		borderTopWidth: 4,
		borderTopColor: '#3C6E71',
		borderWidth: 1,
		borderColor: '#DCE5E8',
		padding: 18,
		gap: 12,
		shadowColor: '#0F172A',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 6,
		marginBottom: 12,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '800',
		color: '#1E293B',
		marginBottom: 8,
	},
	detailRow: {
		gap: 4,
		paddingBottom: 12,
		marginBottom: 2,
		borderBottomWidth: 1,
	},
	detailLabel: {
		fontSize: 12,
		fontWeight: '700',
	},
	detailValue: {
		fontSize: 15,
		fontWeight: '700',
	},
	input: {
		borderWidth: 1,
		borderColor: '#CBD5E1',
		borderRadius: 12,
		paddingHorizontal: 12,
		paddingVertical: 12,
		fontSize: 15,
		color: '#1F2937',
		backgroundColor: '#F8FAFC',
	},
	helperText: {
		fontSize: 12,
		fontWeight: '600',
		color: '#64748B',
		marginTop: -4,
		marginBottom: 2,
	},
	saveBtn: {
		marginTop: 10,
		backgroundColor: '#0F766E',
		borderWidth: 1,
		borderColor: '#0F5B56',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		shadowColor: '#0F766E',
		shadowOpacity: 0.24,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 10,
		elevation: 4,
	},
	saveBtnDisabled: {
		opacity: 0.7,
	},
	btnPressed: {
		opacity: 0.9,
		transform: [{ scale: 0.98 }],
	},
	saveBtnText: {
		fontSize: 16,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	secondaryBtn: {
		marginTop: 10,
		backgroundColor: '#1E293B',
		borderWidth: 1,
		borderColor: '#334155',
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		shadowOpacity: 0.16,
		shadowOffset: { width: 0, height: 5 },
		shadowRadius: 8,
		elevation: 3,
	},
	secondaryBtnText: {
		fontSize: 15,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	messageText: {
		marginTop: 4,
		fontSize: 13,
		fontWeight: '700',
		color: '#0F766E',
	},
});
