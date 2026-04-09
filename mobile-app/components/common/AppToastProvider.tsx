import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import FadeInView from '@/components/common/FadeInView';
import { ThemedText } from '@/components/themed-text';
import { useSettingsTheme } from '@/theme/settingsTheme';

type ToastType = 'success' | 'error' | 'info';

type ToastState = {
	id: number;
	type: ToastType;
	message: string;
};

type ToastContextValue = {
	showToast: (type: ToastType, message: string) => void;
	showSuccess: (message: string) => void;
	showError: (message: string) => void;
	showInfo: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function AppToastProvider({ children }: { children: ReactNode }) {
	const [toasts, setToasts] = useState<ToastState[]>([]);
	const { palette } = useSettingsTheme();

	const showToast = useCallback((type: ToastType, message: string) => {
		const id = Date.now() + Math.floor(Math.random() * 1000);
		setToasts((prev) => [...prev, { id, type, message }]);

		setTimeout(() => {
			setToasts((prev) => prev.filter((toast) => toast.id !== id));
		}, 3000);
	}, []);

	const value = useMemo<ToastContextValue>(
		() => ({
			showToast,
			showSuccess: (message: string) => showToast('success', message),
			showError: (message: string) => showToast('error', message),
			showInfo: (message: string) => showToast('info', message),
		}),
		[showToast]
	);

	return (
		<ToastContext.Provider value={value}>
			{children}
			<View style={[styles.wrap, styles.noPointerEvents]}>
				{toasts.map((toast, index) => (
					<FadeInView key={toast.id} delay={index * 40} distance={4}>
						<View
							style={[
								styles.toast,
								{ borderColor: palette.border, backgroundColor: palette.elevatedBg },
								toast.type === 'success'
									? { backgroundColor: palette.successSoft, borderColor: palette.successBorder }
									: null,
								toast.type === 'error'
									? { backgroundColor: palette.dangerSoft, borderColor: palette.dangerBorder }
									: null,
								toast.type === 'info'
									? { backgroundColor: palette.infoSoft, borderColor: palette.infoBorder }
									: null,
							]}
						>
							<ThemedText style={[styles.toastText, { color: palette.text }]}>{toast.message}</ThemedText>
						</View>
					</FadeInView>
				))}
			</View>
		</ToastContext.Provider>
	);
}

export function useAppToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) {
		throw new Error('useAppToast must be used inside AppToastProvider');
	}

	return ctx;
}

const styles = StyleSheet.create({
	wrap: {
		position: 'absolute',
		top: 52,
		left: 12,
		right: 12,
		gap: 8,
		zIndex: 9999,
	},
	noPointerEvents: {
		pointerEvents: 'none',
	},
	toast: {
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderRadius: 10,
		borderWidth: 1,
	},
	toastText: {
		fontSize: 13,
		fontWeight: '700',
	},
});
