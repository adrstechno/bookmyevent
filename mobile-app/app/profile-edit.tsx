import { Redirect, useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
	Animated,
	ActivityIndicator,
	BackHandler,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
	useWindowDimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppTopBar } from '@/components/layout/AppTopBar';
import { changePassword } from '@/services/auth/authApi';
import { getUserProfile, updateUserProfile } from '@/services/auth/profileApi';
import { ThemedText } from '@/components/themed-text';
import { useAppSelector, useAppDispatch } from '@/store';
import { updateProfile } from '@/store/slices/authSlice';
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
	const dispatch = useAppDispatch();
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
		email: params.email ?? authEmail ?? '',
		phone: params.phone ?? '',
	});
	const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
	});

	const [profileMessage, setProfileMessage] = useState('');
	const [profileMessageType, setProfileMessageType] = useState<'success' | 'error'>('error');
	const [passwordMessage, setPasswordMessage] = useState('');
	const [passwordMessageType, setPasswordMessageType] = useState<'success' | 'error'>('error');
	const [isSavingProfile, setIsSavingProfile] = useState(false);
	const [isChangingPassword, setIsChangingPassword] = useState(false);
	const [isEditMode, setIsEditMode] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);

	const headerAnim = useRef(new Animated.Value(0)).current;
	const cardAnim = useRef(new Animated.Value(0)).current;

	// Entry animations
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

	// Load profile from backend on mount
	useEffect(() => {
		void (async () => {
			if (!isAuthenticated) return;

			try {
				setIsLoadingProfile(true);
				const profile = await getUserProfile();
				setForm({
					firstName: profile.first_name || '',
					lastName: profile.last_name || '',
					email: profile.email || '',
					phone: profile.phone || '',
				});
			} catch (error) {
				console.error('Failed to load profile:', error);
				// Fallback to Redux store data
				const fallbackFirstName = (authName || 'Guest').split(' ')[0] || 'Guest';
				const fallbackLastName = (authName || '').split(' ').slice(1).join(' ');
				setForm((prev) => ({
					...prev,
					firstName: fallbackFirstName,
					lastName: fallbackLastName,
					email: authEmail ?? prev.email,
				}));
				setProfileMessage('Could not load latest profile. Showing cached data.');
				setProfileMessageType('error');
			} finally {
				setIsLoadingProfile(false);
			}
		})();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isAuthenticated]);

	// Hardware back button
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

	const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

	const isValidPhone = (value: string) => value.replace(/\D/g, '').length === 10;

	// ─── Save Profile ────────────────────────────────────────────
	const onSave = () => {
		void (async () => {
			const payload = {
				first_name: form.firstName.trim(),
				last_name: form.lastName.trim(),
				email: form.email.trim().toLowerCase(),
				phone: form.phone.trim(),
			};

			if (!payload.first_name || !payload.last_name || !payload.email || !payload.phone) {
				setProfileMessage('Please fill all profile fields.');
				setProfileMessageType('error');
				return;
			}

			if (!isValidEmail(payload.email)) {
				setProfileMessage('Please enter a valid email address.');
				setProfileMessageType('error');
				return;
			}

			if (!isValidPhone(payload.phone)) {
				setProfileMessage('Please enter a valid 10-digit phone number.');
				setProfileMessageType('error');
				return;
			}

			setIsSavingProfile(true);
			setProfileMessage('');

			try {
				const updatedProfile = await updateUserProfile(payload);

				// Sync updated name & email back to Redux store
				dispatch(updateProfile({
					name: `${updatedProfile.first_name} ${updatedProfile.last_name}`.trim(),
					email: updatedProfile.email,
				}));

				// Refresh local form with server response
				setForm({
					firstName: updatedProfile.first_name || '',
					lastName: updatedProfile.last_name || '',
					email: updatedProfile.email || '',
					phone: updatedProfile.phone || '',
				});

				setProfileMessage('Profile updated successfully! ✓');
				setProfileMessageType('success');
				setIsEditMode(false);

				setTimeout(() => setProfileMessage(''), 3000);
			} catch (error: unknown) {
				const err = error as { response?: { data?: { message?: string } }; message?: string };
				const errorMessage = err?.response?.data?.message || err?.message || 'Failed to update profile. Please try again.';
				setProfileMessage(errorMessage);
				setProfileMessageType('error');
			} finally {
				setIsSavingProfile(false);
			}
		})();
	};

	// ─── Change Password ─────────────────────────────────────────
	const onChangePassword = () => {
		void (async () => {
			const currentPassword = passwordForm.currentPassword.trim();
			const newPassword = passwordForm.newPassword.trim();
			const confirmPassword = passwordForm.confirmPassword.trim();

			if (!currentPassword || !newPassword || !confirmPassword) {
				setPasswordMessage('Please fill all password fields.');
				setPasswordMessageType('error');
				return;
			}

			if (newPassword.length < 6) {
				setPasswordMessage('New password must be at least 6 characters.');
				setPasswordMessageType('error');
				return;
			}

			if (newPassword !== confirmPassword) {
				setPasswordMessage('New password and confirm password must match.');
				setPasswordMessageType('error');
				return;
			}

			setIsChangingPassword(true);
			setPasswordMessage('');

			try {
				const message = await changePassword({
					oldPassword: currentPassword,
					newPassword,
				});
				setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
				setPasswordMessage(message || 'Password changed successfully. ✓');
				setPasswordMessageType('success');

				setTimeout(() => setPasswordMessage(''), 3000);
			} catch (error: unknown) {
				const err = error as { response?: { data?: { message?: string } }; message?: string };
				const errorMessage = err?.response?.data?.message || err?.message || 'Unable to change password. Please try again.';
				setPasswordMessage(errorMessage);
				setPasswordMessageType('error');
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

			{/* ── Header ── */}
			<Animated.View
				style={[
					styles.header,
					{ backgroundColor: palette.surfaceBg, borderBottomColor: palette.border },
					{
						opacity: headerAnim,
						transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-14, 0] }) }],
					},
				]}
			>
				<AppTopBar title={isEditMode ? 'Edit Profile' : 'Profile Details'} onBackPress={goBack} />
			</Animated.View>

			<ScrollView
				style={[styles.page, { backgroundColor: palette.screenBg }]}
				contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 20 }]}
				showsVerticalScrollIndicator={false}
				keyboardShouldPersistTaps="handled"
			>
				{/* ── Profile Card ── */}
				<Animated.View
					style={[
						styles.card,
						{ backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.tint },
						{ minHeight: Math.max(screenHeight * 0.5, 360) },
						{
							opacity: cardAnim,
							transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
						},
					]}
				>
					<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Profile Information</ThemedText>

					{/* Loading State */}
					{isLoadingProfile ? (
						<View style={styles.loadingContainer}>
							<ActivityIndicator size="large" color={palette.tint} />
							<ThemedText style={[styles.loadingText, { color: palette.subtext }]}>Loading profile...</ThemedText>
						</View>
					) : isEditMode ? (
						/* ── Edit Mode ── */
						<>
							<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>First Name</ThemedText>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.firstName}
								onChangeText={(value) => setForm((prev) => ({ ...prev, firstName: value }))}
								placeholder="First Name"
								placeholderTextColor={palette.subtext}
								autoCapitalize="words"
							/>

							<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>Last Name</ThemedText>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.lastName}
								onChangeText={(value) => setForm((prev) => ({ ...prev, lastName: value }))}
								placeholder="Last Name"
								placeholderTextColor={palette.subtext}
								autoCapitalize="words"
							/>

							<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>Email</ThemedText>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.email}
								onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))}
								placeholder="Email"
								placeholderTextColor={palette.subtext}
								keyboardType="email-address"
								autoCapitalize="none"
							/>

							<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>Phone</ThemedText>
							<TextInput
								style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
								value={form.phone}
								onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))}
								placeholder="10-digit Phone Number"
								placeholderTextColor={palette.subtext}
								keyboardType="phone-pad"
								maxLength={10}
							/>

							<Pressable
								style={({ pressed }) => [
									styles.saveBtn,
									{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
									isSavingProfile && styles.saveBtnDisabled,
									pressed && styles.btnPressed,
								]}
								onPress={onSave}
								disabled={isSavingProfile}
							>
								{isSavingProfile ? (
									<ActivityIndicator size="small" color="#FFFFFF" />
								) : (
									<ThemedText style={styles.saveBtnText}>Save Profile</ThemedText>
								)}
							</Pressable>

							<Pressable
								style={({ pressed }) => [
									styles.cancelBtn,
									{ backgroundColor: palette.elevatedBg, borderColor: palette.border },
									pressed && styles.btnPressed,
								]}
								onPress={() => {
									setIsEditMode(false);
									setProfileMessage('');
								}}
							>
								<ThemedText style={[styles.cancelBtnText, { color: palette.subtext }]}>Cancel</ThemedText>
							</Pressable>
						</>
					) : (
						/* ── View Mode ── */
						<>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}>
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>First Name</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>
									{form.firstName || '—'}
								</ThemedText>
							</View>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}>
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Last Name</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>
									{form.lastName || '—'}
								</ThemedText>
							</View>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}>
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Email</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>
									{form.email || '—'}
								</ThemedText>
							</View>
							<View style={[styles.detailRow, { borderBottomColor: palette.border }]}>
								<ThemedText style={[styles.detailLabel, { color: palette.subtext }]}>Phone</ThemedText>
								<ThemedText style={[styles.detailValue, { color: palette.text }]}>
									{form.phone || '—'}
								</ThemedText>
							</View>

							<Pressable
								style={({ pressed }) => [
									styles.saveBtn,
									{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
									pressed && styles.btnPressed,
								]}
								onPress={() => {
									setProfileMessage('');
									setIsEditMode(true);
								}}
							>
								<ThemedText style={styles.saveBtnText}>Edit Profile</ThemedText>
							</Pressable>
						</>
					)}

					{/* Profile message (success / error) */}
					{profileMessage ? (
						<ThemedText
							style={[
								styles.messageText,
								{ color: profileMessageType === 'success' ? '#16a34a' : '#dc2626' },
							]}
						>
							{profileMessage}
						</ThemedText>
					) : null}
				</Animated.View>

				{/* ── Change Password Card (only in edit mode) ── */}
				{isEditMode ? (
					<Animated.View
						style={[
							styles.card,
							{ backgroundColor: palette.surfaceBg, borderColor: palette.border, borderTopColor: palette.tint },
							{
								opacity: cardAnim,
								transform: [{ translateY: cardAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
							},
						]}
					>
						<ThemedText style={[styles.cardTitle, { color: palette.text }]}>Change Password</ThemedText>
						<ThemedText style={[styles.helperText, { color: palette.subtext }]}>
							Enter your current password and choose a new secure password.
						</ThemedText>

						<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>Current Password</ThemedText>
						<TextInput
							style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
							value={passwordForm.currentPassword}
							onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, currentPassword: value }))}
							placeholder="Current Password"
							placeholderTextColor={palette.subtext}
							secureTextEntry
						/>

						<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>New Password</ThemedText>
						<TextInput
							style={[styles.input, { backgroundColor: palette.headerBtnBg, borderColor: palette.border, color: palette.text }]}
							value={passwordForm.newPassword}
							onChangeText={(value) => setPasswordForm((prev) => ({ ...prev, newPassword: value }))}
							placeholder="New Password (min 6 characters)"
							placeholderTextColor={palette.subtext}
							secureTextEntry
						/>

						<ThemedText style={[styles.fieldLabel, { color: palette.subtext }]}>Confirm New Password</ThemedText>
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
								styles.saveBtn,
								{ backgroundColor: palette.primary, borderColor: palette.primaryStrong, shadowColor: palette.shadow },
								isChangingPassword && styles.saveBtnDisabled,
								pressed && styles.btnPressed,
							]}
							onPress={onChangePassword}
							disabled={isChangingPassword}
						>
							{isChangingPassword ? (
								<ActivityIndicator size="small" color="#FFFFFF" />
							) : (
								<ThemedText style={styles.saveBtnText}>Update Password</ThemedText>
							)}
						</Pressable>

						{/* Password message (success / error) */}
						{passwordMessage ? (
							<ThemedText
								style={[
									styles.messageText,
									{ color: passwordMessageType === 'success' ? '#16a34a' : '#dc2626' },
								]}
							>
								{passwordMessage}
							</ThemedText>
						) : null}
					</Animated.View>
				) : null}
			</ScrollView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
	},
	header: {
		borderBottomWidth: 1,
	},
	page: {
		flex: 1,
	},
	container: {
		padding: 16,
		gap: 0,
	},
	card: {
		borderRadius: 20,
		borderTopWidth: 4,
		borderWidth: 1,
		padding: 18,
		gap: 10,
		shadowColor: '#0F172A',
		shadowOpacity: 0.08,
		shadowOffset: { width: 0, height: 8 },
		shadowRadius: 16,
		elevation: 6,
		marginBottom: 16,
	},
	cardTitle: {
		fontSize: 18,
		fontWeight: '800',
		marginBottom: 4,
	},
	loadingContainer: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 40,
		gap: 12,
	},
	loadingText: {
		fontSize: 14,
		fontWeight: '600',
	},
	fieldLabel: {
		fontSize: 12,
		fontWeight: '700',
		marginBottom: -4,
		marginTop: 2,
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
		fontWeight: '600',
	},
	input: {
		borderWidth: 1,
		borderRadius: 12,
		paddingHorizontal: 14,
		paddingVertical: 13,
		fontSize: 15,
	},
	helperText: {
		fontSize: 12,
		fontWeight: '600',
		marginTop: -4,
		marginBottom: 2,
	},
	saveBtn: {
		marginTop: 6,
		borderWidth: 1,
		paddingVertical: 14,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		shadowOpacity: 0.24,
		shadowOffset: { width: 0, height: 6 },
		shadowRadius: 10,
		elevation: 4,
		minHeight: 50,
	},
	saveBtnDisabled: {
		opacity: 0.65,
	},
	btnPressed: {
		opacity: 0.88,
		transform: [{ scale: 0.98 }],
	},
	saveBtnText: {
		fontSize: 16,
		fontWeight: '800',
		color: '#FFFFFF',
	},
	cancelBtn: {
		marginTop: 2,
		borderWidth: 1,
		paddingVertical: 13,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 48,
	},
	cancelBtnText: {
		fontSize: 15,
		fontWeight: '700',
	},
	messageText: {
		marginTop: 6,
		fontSize: 13,
		fontWeight: '700',
		textAlign: 'center',
	},
});
