import { Stack } from 'expo-router';
import { Component, type ErrorInfo, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';

import { AppToastProvider } from '@/components/common/AppToastProvider';
import { AppPalettes } from '@/constants/theme';
import { clearApiAuthToken, setApiAuthToken } from '@/services/api/client';
import { useAppDispatch, useAppSelector, store } from '@/store';
import { bootstrapAuth } from '@/store/slices/authSlice';
import { useSettingsTheme } from '@/theme/settingsTheme';

type AppErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};

type AppPalette = (typeof AppPalettes)[keyof typeof AppPalettes];

type AppErrorBoundaryProps = {
	children: React.ReactNode;
	palette: AppPalette;
};

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
	state: AppErrorBoundaryState = {
		hasError: false,
		errorMessage: '',
	};

	static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
		return {
			hasError: true,
			errorMessage: error?.message ?? 'Unexpected error occurred.',
		};
	}

	componentDidCatch(error: Error, errorInfo: ErrorInfo) {
		console.error('AppErrorBoundary caught error:', error, errorInfo);
	}

	private onTryAgain = () => {
		this.setState({ hasError: false, errorMessage: '' });
	};

	render() {
		if (this.state.hasError) {
			const { palette } = this.props;
			return (
				<View style={[styles.errorWrap, { backgroundColor: palette.screenBg }]}>
					<Text style={[styles.errorTitle, { color: palette.text }]}>Something went wrong</Text>
					<Text style={[styles.errorSubtitle, { color: palette.subtext }]}>The app ran into an unexpected issue. Please try again.</Text>
					<Text style={[styles.errorHint, { color: palette.muted }]}>Error: {this.state.errorMessage}</Text>
					<Pressable style={[styles.errorBtn, { backgroundColor: palette.primary }]} onPress={this.onTryAgain}>
						<Text style={[styles.errorBtnText, { color: palette.onPrimary }]}>Try Again</Text>
					</Pressable>
				</View>
			);
		}

		return this.props.children;
	}
}

function RootNavigator() {
	const dispatch = useAppDispatch();
	const { isHydrated, token } = useAppSelector((state) => state.auth);
	const { palette } = useSettingsTheme();

	useEffect(() => {
		dispatch(bootstrapAuth());
	}, [dispatch]);

	useEffect(() => {
		if (token) {
			setApiAuthToken(token);
			return;
		}

		clearApiAuthToken();
	}, [token]);

	if (!isHydrated) {
		return (
			<View style={[styles.loaderWrap, { backgroundColor: palette.screenBg }]}>
				<ActivityIndicator size="large" color={palette.primary} />
				<Text style={[styles.loaderText, { color: palette.subtext }]}>Checking authentication...</Text>
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
			<Stack.Screen name="(vendor)" options={{ headerShown: false }} />
			<Stack.Screen name="(admin)" options={{ headerShown: false }} />
			<Stack.Screen name="notifications" options={{ headerShown: false }} />
			<Stack.Screen name="app-error" options={{ headerShown: false }} />
			<Stack.Screen name="about-us" options={{ headerShown: false }} />
			<Stack.Screen name="profile-edit" options={{ headerShown: false }} />
			<Stack.Screen name="favorites" options={{ headerShown: false }} />
			<Stack.Screen name="settings" options={{ headerShown: false }} />
			<Stack.Screen name="support" options={{ headerShown: false }} />
		</Stack>
	);
}

export default function RootLayout() {
	const { palette } = useSettingsTheme();

	return (
		<Provider store={store}>
			<AppToastProvider>
				<AppErrorBoundary palette={palette}>
					<RootNavigator />
				</AppErrorBoundary>
			</AppToastProvider>
		</Provider>
	);
}

const styles = StyleSheet.create({
	loaderWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	loaderText: {
		fontSize: 15,
		fontWeight: '700',
	},
	errorWrap: {
		flex: 1,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: '800',
		textAlign: 'center',
	},
	errorSubtitle: {
		marginTop: 10,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
	},
	errorHint: {
		marginTop: 8,
		fontSize: 12,
		textAlign: 'center',
	},
	errorBtn: {
		marginTop: 18,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 10,
	},
	errorBtnText: {
		fontSize: 14,
		fontWeight: '700',
	},
});

