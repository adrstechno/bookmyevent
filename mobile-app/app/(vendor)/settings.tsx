import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback, useEffect, useState } from 'react';
import {
	ActivityIndicator,
	Image,
	Modal,
	Pressable,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';

import FadeInView from '@/components/common/FadeInView';
import { ThemedText } from '@/components/themed-text';
import { useAppToast } from '@/components/common/AppToastProvider';
import { useSettingsTheme } from '@/theme/settingsTheme';
import VendorAppBar from '@/components/vendor/VendorAppBar';
import {
	fetchVendorProfile,
	fetchVendorServiceCategories,
	fetchVendorSubServices,
	saveVendorProfile,
	changeVendorPassword,
} from '@/services/vendor/vendorService';
import { useAppSelector } from '@/store';
import type { VendorServiceCategory, VendorSubService } from '@/types/vendor';

interface FormData {
	business_name: string;
	service_category_id: string | number;
	subservice_id: string | number;
	description: string;
	years_experience: string;
	contact: string;
	address: string;
	city: string;
	state: string;
	event_profiles_url: string;
}

interface FormErrors {
	[key: string]: string;
}

const EMPTY_FORM: FormData = {
	business_name: '',
	service_category_id: '',
	subservice_id: '',
	description: '',
	years_experience: '',
	contact: '',
	address: '',
	city: '',
	state: '',
	event_profiles_url: '',
};

export default function VendorSettingsScreen() {
	const { palette } = useSettingsTheme();
	const { showError, showSuccess } = useAppToast();
	const email = useAppSelector((state) => state.auth.email) ?? '';

	const [pageLoading, setPageLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [showPasswordModal, setShowPasswordModal] = useState(false);
	const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
	const [passwordErrors, setPasswordErrors] = useState<FormErrors>({});
	const [isChangingPassword, setIsChangingPassword] = useState(false);

	const [profileImage, setProfileImage] = useState<string>('https://via.placeholder.com/90');
	const [profileImageUri, setProfileImageUri] = useState<string | null>(null);
	const [categories, setCategories] = useState<VendorServiceCategory[]>([]);
	const [subServices, setSubServices] = useState<VendorSubService[]>([]);
	const [showCategoryPicker, setShowCategoryPicker] = useState(false);
	const [showSubServicePicker, setShowSubServicePicker] = useState(false);

	const [formData, setFormData] = useState<FormData>(EMPTY_FORM);
	const [errors, setErrors] = useState<FormErrors>({});

	// ── Load profile + categories on mount ──────────────────────
	useEffect(() => {
		const load = async () => {
			try {
				const [profile, cats] = await Promise.all([
					fetchVendorProfile(),
					fetchVendorServiceCategories(),
				]);

				setCategories(cats);

				if (profile) {
					setFormData({
						business_name: profile.businessName,
						service_category_id: profile.serviceCategoryId,
						subservice_id: profile.subserviceId,
						description: profile.description,
						years_experience: String(profile.yearsExperience || ''),
						contact: profile.contact,
						address: profile.address,
						city: profile.city,
						state: profile.state,
						event_profiles_url: profile.eventProfilesUrl,
					});

					if (profile.profileImageUrl) {
						setProfileImage(profile.profileImageUrl);
					}

					// Load subservices for the saved category
					if (profile.serviceCategoryId) {
						try {
							const subs = await fetchVendorSubServices(profile.serviceCategoryId);
							setSubServices(subs);
						} catch {
							// non-fatal
						}
					}
				}
			} catch {
				showError('Failed to load profile');
			} finally {
				setPageLoading(false);
			}
		};

		load();
	}, []);

	// ── When category changes, fetch subservices from API ───────
	const handleCategoryChange = useCallback(async (categoryId: string | number) => {
		setFormData((prev) => ({ ...prev, service_category_id: categoryId, subservice_id: '' }));
		setSubServices([]);
		setShowCategoryPicker(false);

		if (!categoryId) return;
		try {
			const subs = await fetchVendorSubServices(categoryId);
			setSubServices(subs);
		} catch {
			showError('Failed to load sub-services');
		}
	}, []);

	const handleImagePick = async () => {
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [1, 1],
				quality: 0.8,
			});

			if (!result.canceled) {
				setProfileImage(result.assets[0].uri);
				setProfileImageUri(result.assets[0].uri);
			}
		} catch {
			showError('Failed to pick image');
		}
	};

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));
		setErrors((prev) => ({ ...prev, [field]: '' }));
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!formData.business_name.trim()) {
			newErrors.business_name = 'Business name is required';
		}
		if (!formData.service_category_id) {
			newErrors.service_category_id = 'Select a service category';
		}
		if (!formData.description.trim()) {
			newErrors.description = 'Description is required';
		}
		if (!formData.years_experience.trim() || isNaN(Number(formData.years_experience)) || Number(formData.years_experience) <= 0) {
			newErrors.years_experience = 'Enter valid years of experience';
		}
		if (!/^[0-9]{10}$/.test(formData.contact)) {
			newErrors.contact = 'Enter a valid 10-digit contact number';
		}
		if (!formData.address.trim()) {
			newErrors.address = 'Address is required';
		}
		if (!formData.city.trim()) {
			newErrors.city = 'City is required';
		}
		if (!formData.state.trim()) {
			newErrors.state = 'State is required';
		}
		if (formData.event_profiles_url && !/^https?:\/\/.+/.test(formData.event_profiles_url)) {
			newErrors.event_profiles_url = 'Enter a valid URL (http or https)';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSaveProfile = async () => {
		if (!validateForm()) {
			showError('Please fix the highlighted errors');
			return;
		}

		setIsSaving(true);
		try {
			await saveVendorProfile(
				{
					businessName: formData.business_name,
					serviceCategoryId: String(formData.service_category_id),
					subserviceId: formData.subservice_id ? String(formData.subservice_id) : undefined,
					description: formData.description,
					yearsExperience: formData.years_experience,
					contact: formData.contact,
					address: formData.address,
					city: formData.city,
					state: formData.state,
					eventProfilesUrl: formData.event_profiles_url,
					profileImageUri: profileImageUri ?? undefined,
				},
				{ isNewProfile: false }
			);
			showSuccess('Profile updated successfully!');
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message ?? 'Failed to save profile';
			showError(msg);
		} finally {
			setIsSaving(false);
		}
	};

	const validatePassword = (): boolean => {
		const newErrors: FormErrors = {};

		if (!passwordData.oldPassword.trim()) {
			newErrors.oldPassword = 'Current password is required';
		}
		if (!passwordData.newPassword.trim() || passwordData.newPassword.length < 6) {
			newErrors.newPassword = 'New password must be at least 6 characters';
		}
		if (passwordData.newPassword !== passwordData.confirmPassword) {
			newErrors.confirmPassword = 'Passwords do not match';
		}

		setPasswordErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleChangePassword = async () => {
		if (!validatePassword()) {
			return;
		}

		setIsChangingPassword(true);
		try {
			await changeVendorPassword({
				email,
				oldPassword: passwordData.oldPassword,
				newPassword: passwordData.newPassword,
			});
			showSuccess('Password changed successfully!');
			setShowPasswordModal(false);
			setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
			setPasswordErrors({});
		} catch (err: unknown) {
			const msg = (err as { message?: string })?.message ?? 'Failed to change password';
			showError(msg);
		} finally {
			setIsChangingPassword(false);
		}
	};

	const renderCategoryPicker = () => {
		const selectedCat = categories.find((c) => String(c.id) === String(formData.service_category_id));
		return (
			<Pressable
				style={({ pressed }) => [
					styles.selectButton,
					{
						backgroundColor: pressed ? palette.pressedBg : palette.surfaceBg,
						borderColor: errors.service_category_id ? '#dc2626' : palette.border,
					},
				]}
				onPress={() => setShowCategoryPicker(true)}
			>
				<ThemedText style={{ color: selectedCat ? palette.text : palette.muted }}>
					{selectedCat?.name || 'Select Service Category'}
				</ThemedText>
				<Ionicons name="chevron-down" size={20} color={palette.text} />
			</Pressable>
		);
	};

	const renderSubServicePicker = () => {
		const selectedSub = subServices.find((s) => String(s.subserviceId) === String(formData.subservice_id));
		const isDisabled = !formData.service_category_id || subServices.length === 0;
		return (
			<Pressable
				style={({ pressed }) => [
					styles.selectButton,
					{
						backgroundColor: isDisabled ? `${palette.muted}20` : pressed ? palette.pressedBg : palette.surfaceBg,
						borderColor: errors.subservice_id ? '#dc2626' : palette.border,
						opacity: isDisabled ? 0.6 : 1,
					},
				]}
				onPress={() => !isDisabled && setShowSubServicePicker(true)}
				disabled={isDisabled}
			>
				<ThemedText style={{ color: selectedSub ? palette.text : palette.muted }}>
					{selectedSub?.subserviceName ||
						(formData.service_category_id ? 'Select Sub-Service' : 'Select Category First')}
				</ThemedText>
				<Ionicons name="chevron-down" size={20} color={isDisabled ? palette.muted : palette.text} />
			</Pressable>
		);
	};

	const styles = createStyles(palette);

	if (pageLoading) {
		return (
			<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
				<VendorAppBar title="Vendor Settings" />
				<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
					<ActivityIndicator size="large" color={palette.primary} />
					<ThemedText style={{ marginTop: 12, color: palette.muted }}>Loading profile...</ThemedText>
				</View>
			</SafeAreaView>
		);
	}

	return (
		<SafeAreaView style={{ flex: 1, backgroundColor: palette.screenBg }}>
			<VendorAppBar title="Vendor Settings" />
			<ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
				<FadeInView>
					<View style={styles.headerCard}>
						<ThemedText style={styles.headerTitle}>Vendor Settings</ThemedText>
						<View style={styles.headerBadge}>
							<Ionicons name="person-circle" size={24} color="#fff" />
							<ThemedText style={styles.headerBadgeText}>Welcome, Vendor</ThemedText>
						</View>
					</View>
				</FadeInView>

				<FadeInView>
					<View style={styles.profileCard}>
						<ThemedText style={styles.sectionTitle}>Update Profile Details</ThemedText>

						<View style={styles.profilePictureSection}>
							<Image source={{ uri: profileImage }} style={styles.profileImage} />
							<Pressable
								style={({ pressed }) => [
									styles.uploadButton,
									{ backgroundColor: pressed ? '#8B1A4A' : palette.primary },
								]}
								onPress={handleImagePick}
							>
								<Ionicons name="image" size={18} color="#fff" />
								<ThemedText style={styles.uploadButtonText}>Change Photo</ThemedText>
							</Pressable>
						</View>

						<View style={styles.formSection}>
							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Business Name</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.business_name ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="Enter business name"
									placeholderTextColor={palette.muted}
									value={formData.business_name}
									onChangeText={(val) => handleInputChange('business_name', val)}
								/>
								{errors.business_name ? <ThemedText style={styles.errorText}>{errors.business_name}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Service Category</ThemedText>
								{renderCategoryPicker()}
								{errors.service_category_id ? (
									<ThemedText style={styles.errorText}>{errors.service_category_id}</ThemedText>
								) : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Sub-Service</ThemedText>
								{renderSubServicePicker()}
								{errors.subservice_id ? <ThemedText style={styles.errorText}>{errors.subservice_id}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Description</ThemedText>
								<TextInput
									style={[
										styles.textArea,
										{
											borderColor: errors.description ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="Briefly describe your services"
									placeholderTextColor={palette.muted}
									value={formData.description}
									onChangeText={(val) => handleInputChange('description', val)}
									multiline
									numberOfLines={3}
								/>
								{errors.description ? <ThemedText style={styles.errorText}>{errors.description}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Years of Experience</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.years_experience ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="e.g. 5"
									placeholderTextColor={palette.muted}
									value={formData.years_experience}
									onChangeText={(val) => handleInputChange('years_experience', val)}
									keyboardType="number-pad"
								/>
								{errors.years_experience ? (
									<ThemedText style={styles.errorText}>{errors.years_experience}</ThemedText>
								) : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Contact Number</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.contact ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="10-digit mobile number"
									placeholderTextColor={palette.muted}
									value={formData.contact}
									onChangeText={(val) => handleInputChange('contact', val.slice(0, 10))}
									keyboardType="phone-pad"
									maxLength={10}
								/>
								{errors.contact ? <ThemedText style={styles.errorText}>{errors.contact}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Address</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.address ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="Full address"
									placeholderTextColor={palette.muted}
									value={formData.address}
									onChangeText={(val) => handleInputChange('address', val)}
								/>
								{errors.address ? <ThemedText style={styles.errorText}>{errors.address}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>City</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.city ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="City name"
									placeholderTextColor={palette.muted}
									value={formData.city}
									onChangeText={(val) => handleInputChange('city', val)}
								/>
								{errors.city ? <ThemedText style={styles.errorText}>{errors.city}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>State</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.state ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="State name"
									placeholderTextColor={palette.muted}
									value={formData.state}
									onChangeText={(val) => handleInputChange('state', val)}
								/>
								{errors.state ? <ThemedText style={styles.errorText}>{errors.state}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Event Profile / Social URL</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: errors.event_profiles_url ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="https://instagram.com/yourpage"
									placeholderTextColor={palette.muted}
									value={formData.event_profiles_url}
									onChangeText={(val) => handleInputChange('event_profiles_url', val)}
								/>
								{errors.event_profiles_url ? (
									<ThemedText style={styles.errorText}>{errors.event_profiles_url}</ThemedText>
								) : null}
							</View>
						</View>

						<View style={styles.buttonGroup}>
							<Pressable
								style={({ pressed }) => [
									styles.secondaryButton,
									{
										backgroundColor: pressed ? '#d9d9d9' : palette.elevatedBg,
										opacity: isChangingPassword || isSaving ? 0.6 : 1,
									},
								]}
								onPress={() => setShowPasswordModal(true)}
								disabled={isSaving || isChangingPassword}
							>
								<Ionicons name="lock-closed" size={18} color={palette.primary} />
								<ThemedText style={[styles.buttonText, { color: palette.primary }]}>Change Password</ThemedText>
							</Pressable>

							<Pressable
								style={({ pressed }) => [
									styles.primaryButton,
									{
										backgroundColor: pressed ? '#8B1A4A' : palette.primary,
										opacity: isSaving ? 0.7 : 1,
									},
								]}
								onPress={handleSaveProfile}
								disabled={isSaving}
							>
								{isSaving ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<>
										<Ionicons name="checkmark" size={18} color="#fff" />
										<ThemedText style={[styles.buttonText, { color: '#fff' }]}>Save Changes</ThemedText>
									</>
								)}
							</Pressable>
						</View>
					</View>
				</FadeInView>
			</ScrollView>

			<Modal visible={showCategoryPicker} transparent animationType="slide">
				<SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Pressable style={{ flex: 1 }} onPress={() => setShowCategoryPicker(false)} />
					<View style={[styles.pickerModal, { backgroundColor: palette.surfaceBg }]}>
						<View style={styles.pickerHeader}>
							<ThemedText style={styles.pickerTitle}>Select Service Category</ThemedText>
							<Pressable onPress={() => setShowCategoryPicker(false)}>
								<Ionicons name="close" size={24} color={palette.text} />
							</Pressable>
						</View>
						<ScrollView>
							{categories.map((cat) => (
								<Pressable
									key={cat.id}
									style={({ pressed }) => [
										styles.pickerItem,
										{
											backgroundColor: pressed ? palette.pressedBg : 'transparent',
											borderBottomColor: palette.border,
										},
									]}
									onPress={() => handleCategoryChange(cat.id)}
								>
									<ThemedText style={styles.pickerItemText}>{cat.name}</ThemedText>
									{formData.service_category_id === cat.id ? (
										<Ionicons name="checkmark" size={20} color={palette.primary} />
									) : null}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</SafeAreaView>
			</Modal>

			<Modal visible={showSubServicePicker} transparent animationType="slide">
				<SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)' }}>
					<Pressable style={{ flex: 1 }} onPress={() => setShowSubServicePicker(false)} />
					<View style={[styles.pickerModal, { backgroundColor: palette.surfaceBg }]}>
						<View style={styles.pickerHeader}>
							<ThemedText style={styles.pickerTitle}>Select Sub-Service</ThemedText>
							<Pressable onPress={() => setShowSubServicePicker(false)}>
								<Ionicons name="close" size={24} color={palette.text} />
							</Pressable>
						</View>
						<ScrollView>
							{subServices.map((sub) => (
								<Pressable
									key={sub.subserviceId}
									style={({ pressed }) => [
										styles.pickerItem,
										{
											backgroundColor: pressed ? palette.pressedBg : 'transparent',
											borderBottomColor: palette.border,
										},
									]}
									onPress={() => {
										setFormData((prev) => ({ ...prev, subservice_id: sub.subserviceId }));
										setShowSubServicePicker(false);
									}}
								>
									<ThemedText style={styles.pickerItemText}>{sub.subserviceName}</ThemedText>
									{String(formData.subservice_id) === String(sub.subserviceId) ? (
										<Ionicons name="checkmark" size={20} color={palette.primary} />
									) : null}
								</Pressable>
							))}
						</ScrollView>
					</View>
				</SafeAreaView>
			</Modal>

			<Modal visible={showPasswordModal} transparent animationType="fade">
				<SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center' }}>
					<View style={[styles.passwordModal, { backgroundColor: palette.surfaceBg }]}>
						<View style={styles.modalHeader}>
							<ThemedText style={styles.modalTitle}>Change Password</ThemedText>
							<Pressable onPress={() => setShowPasswordModal(false)}>
								<Ionicons name="close" size={24} color={palette.text} />
							</Pressable>
						</View>

						<View style={styles.passwordForm}>
							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Current Password</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: passwordErrors.oldPassword ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="Enter current password"
									placeholderTextColor={palette.muted}
									secureTextEntry
									value={passwordData.oldPassword}
									onChangeText={(val) => {
										setPasswordData((prev) => ({ ...prev, oldPassword: val }));
										setPasswordErrors((prev) => ({ ...prev, oldPassword: '' }));
									}}
								/>
								{passwordErrors.oldPassword ? <ThemedText style={styles.errorText}>{passwordErrors.oldPassword}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>New Password</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: passwordErrors.newPassword ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="Enter new password"
									placeholderTextColor={palette.muted}
									secureTextEntry
									value={passwordData.newPassword}
									onChangeText={(val) => {
										setPasswordData((prev) => ({ ...prev, newPassword: val }));
										setPasswordErrors((prev) => ({ ...prev, newPassword: '' }));
									}}
								/>
								{passwordErrors.newPassword ? <ThemedText style={styles.errorText}>{passwordErrors.newPassword}</ThemedText> : null}
							</View>

							<View style={styles.fieldGroup}>
								<ThemedText style={styles.label}>Confirm Password</ThemedText>
								<TextInput
									style={[
										styles.input,
										{
											borderColor: passwordErrors.confirmPassword ? '#dc2626' : palette.border,
											color: palette.text,
										},
									]}
									placeholder="Confirm new password"
									placeholderTextColor={palette.muted}
									secureTextEntry
									value={passwordData.confirmPassword}
									onChangeText={(val) => {
										setPasswordData((prev) => ({ ...prev, confirmPassword: val }));
										setPasswordErrors((prev) => ({ ...prev, confirmPassword: '' }));
									}}
								/>
								{passwordErrors.confirmPassword ? (
									<ThemedText style={styles.errorText}>{passwordErrors.confirmPassword}</ThemedText>
								) : null}
							</View>
						</View>

						<View style={styles.modalButtonGroup}>
							<Pressable
								style={({ pressed }) => [
									styles.secondaryButton,
									{
										backgroundColor: pressed ? '#d9d9d9' : palette.elevatedBg,
										flex: 1,
									},
								]}
								onPress={() => setShowPasswordModal(false)}
								disabled={isChangingPassword}
							>
								<ThemedText style={[styles.buttonText, { color: palette.primary }]}>Cancel</ThemedText>
							</Pressable>

							<Pressable
								style={({ pressed }) => [
									styles.primaryButton,
									{
										backgroundColor: pressed ? '#8B1A4A' : palette.primary,
										flex: 1,
										opacity: isChangingPassword ? 0.7 : 1,
									},
								]}
								onPress={handleChangePassword}
								disabled={isChangingPassword}
							>
								{isChangingPassword ? (
									<ActivityIndicator size="small" color="#fff" />
								) : (
									<ThemedText style={[styles.buttonText, { color: '#fff' }]}>Update Password</ThemedText>
								)}
							</Pressable>
						</View>
					</View>
				</SafeAreaView>
			</Modal>
		</SafeAreaView>
	);
}

function createStyles(palette: any) {
	return StyleSheet.create({
		headerContainer: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 12,
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomColor: palette.border,
			borderBottomWidth: 1,
			backgroundColor: palette.screenBg,
		},
		headerText: {
			fontSize: 18,
			fontWeight: '600',
			color: palette.text,
		},
		container: {
			flex: 1,
			backgroundColor: palette.screenBg,
			paddingHorizontal: 16,
			paddingTop: 12,
		},
		headerCard: {
			backgroundColor: palette.primary,
			borderRadius: 12,
			padding: 16,
			marginBottom: 16,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		headerTitle: {
			fontSize: 20,
			fontWeight: '600',
			color: '#fff',
		},
		headerBadge: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
		},
		headerBadgeText: {
			color: '#fff',
			fontSize: 14,
			fontWeight: '500',
		},
		profileCard: {
			backgroundColor: palette.surfaceBg,
			borderRadius: 12,
			padding: 16,
			marginBottom: 20,
			borderTopColor: palette.primary,
			borderTopWidth: 4,
			shadowColor: palette.shadow,
			shadowOffset: { width: 0, height: 2 },
			shadowOpacity: 0.1,
			shadowRadius: 4,
			elevation: 3,
		},
		sectionTitle: {
			fontSize: 16,
			fontWeight: '600',
			color: palette.text,
			marginBottom: 16,
			paddingBottom: 12,
			borderBottomColor: palette.border,
			borderBottomWidth: 1,
		},
		profilePictureSection: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 16,
			marginBottom: 20,
		},
		profileImage: {
			width: 90,
			height: 90,
			borderRadius: 45,
			borderColor: palette.primary,
			borderWidth: 3,
		},
		uploadButton: {
			flexDirection: 'row',
			alignItems: 'center',
			gap: 8,
			paddingHorizontal: 16,
			paddingVertical: 10,
			borderRadius: 8,
		},
		uploadButtonText: {
			color: '#fff',
			fontSize: 13,
			fontWeight: '600',
		},
		formSection: {
			gap: 16,
			marginBottom: 20,
		},
		fieldGroup: {
			marginBottom: 8,
		},
		label: {
			fontSize: 13,
			fontWeight: '600',
			color: palette.text,
			marginBottom: 6,
		},
		input: {
			borderWidth: 1,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 14,
			backgroundColor: palette.surfaceBg,
		},
		textArea: {
			borderWidth: 1,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 10,
			fontSize: 14,
			backgroundColor: palette.surfaceBg,
			textAlignVertical: 'top',
		},
		selectButton: {
			borderWidth: 1,
			borderRadius: 8,
			paddingHorizontal: 12,
			paddingVertical: 12,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		},
		errorText: {
			color: '#dc2626',
			fontSize: 12,
			marginTop: 4,
		},
		buttonGroup: {
			flexDirection: 'row',
			gap: 12,
		},
		primaryButton: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 8,
			paddingVertical: 12,
			borderRadius: 8,
		},
		secondaryButton: {
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'center',
			alignItems: 'center',
			gap: 8,
			paddingVertical: 12,
			borderRadius: 8,
		},
		buttonText: {
			fontSize: 14,
			fontWeight: '600',
		},
		pickerModal: {
			borderTopLeftRadius: 16,
			borderTopRightRadius: 16,
			maxHeight: '70%',
		},
		pickerHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: '#eee',
		},
		pickerTitle: {
			fontSize: 16,
			fontWeight: '600',
		},
		pickerItem: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 14,
			borderBottomWidth: 1,
		},
		pickerItemText: {
			fontSize: 14,
			flex: 1,
		},
		passwordModal: {
			marginHorizontal: 20,
			borderRadius: 12,
			overflow: 'hidden',
		},
		modalHeader: {
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderBottomWidth: 1,
			borderBottomColor: '#eee',
		},
		modalTitle: {
			fontSize: 16,
			fontWeight: '600',
		},
		passwordForm: {
			gap: 16,
			paddingHorizontal: 16,
			paddingVertical: 16,
		},
		modalButtonGroup: {
			flexDirection: 'row',
			gap: 12,
			paddingHorizontal: 16,
			paddingVertical: 12,
			borderTopWidth: 1,
			borderTopColor: '#eee',
		},
	});
}
