import { Stack } from 'expo-router';
import { Component, type ErrorInfo, useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { Provider } from 'react-redux';

import { useAppDispatch, useAppSelector, store } from '@/store';
import { bootstrapAuth } from '@/store/slices/authSlice';

type AppErrorBoundaryState = {
	hasError: boolean;
	errorMessage: string;
};

class AppErrorBoundary extends Component<{ children: React.ReactNode }, AppErrorBoundaryState> {
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
			return (
				<View style={styles.errorWrap}>
					<Text style={styles.errorTitle}>Something went wrong</Text>
					<Text style={styles.errorSubtitle}>The app ran into an unexpected issue. Please try again.</Text>
					<Text style={styles.errorHint}>Error: {this.state.errorMessage}</Text>
					<Pressable style={styles.errorBtn} onPress={this.onTryAgain}>
						<Text style={styles.errorBtnText}>Try Again</Text>
					</Pressable>
				</View>
			);
		}

		return this.props.children;
	}
}

function RootNavigator() {
	const dispatch = useAppDispatch();
	const isHydrated = useAppSelector((state) => state.auth.isHydrated);

	useEffect(() => {
		dispatch(bootstrapAuth());
	}, [dispatch]);

	if (!isHydrated) {
		return (
			<View style={styles.loaderWrap}>
				<ActivityIndicator size="large" color="#0F766E" />
			</View>
		);
	}

	return (
		<Stack screenOptions={{ headerShown: false }}>
			<Stack.Screen name="(auth)" options={{ headerShown: false }} />
			<Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
	return (
		<Provider store={store}>
			<AppErrorBoundary>
				<RootNavigator />
			</AppErrorBoundary>
		</Provider>
	);
}

const styles = StyleSheet.create({
	loaderWrap: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F3F7F6',
	},
	errorWrap: {
		flex: 1,
		paddingHorizontal: 24,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#F8FAFC',
	},
	errorTitle: {
		fontSize: 24,
		fontWeight: '800',
		color: '#0F172A',
		textAlign: 'center',
	},
	errorSubtitle: {
		marginTop: 10,
		fontSize: 14,
		lineHeight: 20,
		color: '#475569',
		textAlign: 'center',
	},
	errorHint: {
		marginTop: 8,
		fontSize: 12,
		color: '#94A3B8',
		textAlign: 'center',
	},
	errorBtn: {
		marginTop: 18,
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 10,
		backgroundColor: '#0F766E',
	},
	errorBtnText: {
		fontSize: 14,
		fontWeight: '700',
		color: '#FFFFFF',
	},
});

