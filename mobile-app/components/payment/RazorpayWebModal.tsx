import { useCallback, useRef } from 'react';
import {
	ActivityIndicator,
	Modal,
	Pressable,
	StyleSheet,
	View,
} from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';

export type RazorpayPaymentResult = {
	razorpay_payment_id: string;
	razorpay_order_id: string;
	razorpay_signature: string;
};

type Props = {
	visible: boolean;
	keyId: string;
	orderId: string;
	amount: number;        // in paise
	currency?: string;
	businessName?: string;
	prefillName?: string;
	prefillEmail?: string;
	onSuccess: (result: RazorpayPaymentResult) => void;
	onCancel: () => void;
	onError: (message: string) => void;
};

// Escapes strings for safe inline JS injection
const safeStr = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/'/g, "\\'");

const buildHtml = (p: {
	keyId: string;
	orderId: string;
	amount: number;
	currency: string;
	businessName: string;
	prefillName: string;
	prefillEmail: string;
}) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background: #f5f5f5; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: sans-serif; }
    .msg { text-align: center; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="msg">Opening payment gateway...</div>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    function postMsg(data) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      }
    }

    window.onload = function () {
      try {
        var rzp = new Razorpay({
          key: "${safeStr(p.keyId)}",
          amount: ${p.amount},
          currency: "${safeStr(p.currency)}",
          name: "${safeStr(p.businessName)}",
          description: "Annual Vendor Subscription",
          order_id: "${safeStr(p.orderId)}",
          prefill: {
            name: "${safeStr(p.prefillName)}",
            email: "${safeStr(p.prefillEmail)}"
          },
          theme: { color: "#f9a826" },
          handler: function(response) {
            postMsg({
              type: "success",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_signature:  response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function() {
              postMsg({ type: "cancelled" });
            }
          }
        });

        rzp.on("payment.failed", function(resp) {
          postMsg({
            type: "error",
            message: (resp.error && (resp.error.description || resp.error.code)) || "Payment failed"
          });
        });

        rzp.open();
      } catch(e) {
        postMsg({ type: "error", message: e.message || "Failed to open payment gateway" });
      }
    };
  </script>
</body>
</html>
`;

export default function RazorpayWebModal({
	visible,
	keyId,
	orderId,
	amount,
	currency = 'INR',
	businessName = 'GoEventify',
	prefillName = '',
	prefillEmail = '',
	onSuccess,
	onCancel,
	onError,
}: Props) {
	const handled = useRef(false);

	const html = buildHtml({
		keyId,
		orderId,
		amount,
		currency,
		businessName,
		prefillName,
		prefillEmail,
	});

	const handleMessage = useCallback(
		(event: WebViewMessageEvent) => {
			if (handled.current) return;
			try {
				const data = JSON.parse(event.nativeEvent.data) as {
					type: string;
					razorpay_payment_id?: string;
					razorpay_order_id?: string;
					razorpay_signature?: string;
					message?: string;
				};

				if (data.type === 'success') {
					handled.current = true;
					onSuccess({
						razorpay_payment_id: data.razorpay_payment_id ?? '',
						razorpay_order_id: data.razorpay_order_id ?? '',
						razorpay_signature: data.razorpay_signature ?? '',
					});
				} else if (data.type === 'cancelled') {
					handled.current = true;
					onCancel();
				} else if (data.type === 'error') {
					handled.current = true;
					onError(data.message ?? 'Payment failed');
				}
			} catch {
				// Ignore non-JSON messages from WebView
			}
		},
		[onSuccess, onCancel, onError],
	);

	return (
		<Modal
			visible={visible}
			animationType="slide"
			presentationStyle="pageSheet"
			onRequestClose={() => {
				if (!handled.current) {
					handled.current = true;
					onCancel();
				}
			}}
		>
			<SafeAreaView style={styles.container} edges={['top']}>
				<View style={styles.header}>
					<ThemedText style={styles.title}>Secure Payment</ThemedText>
					<Pressable
						onPress={() => {
							if (!handled.current) {
								handled.current = true;
								onCancel();
							}
						}}
						hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
					>
						<Ionicons name="close" size={24} color="#555" />
					</Pressable>
				</View>

				<WebView
					source={{ html }}
					style={styles.webview}
					javaScriptEnabled
					domStorageEnabled
					startInLoadingState
					onMessage={handleMessage}
					renderLoading={() => (
						<View style={styles.loader}>
							<ActivityIndicator size="large" color="#f9a826" />
							<ThemedText style={styles.loaderText}>Loading payment gateway...</ThemedText>
						</View>
					)}
				/>
			</SafeAreaView>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#fff' },
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: '#eee',
	},
	title: { fontSize: 17, fontWeight: '700' },
	webview: { flex: 1 },
	loader: {
		position: 'absolute',
		inset: 0,
		alignItems: 'center',
		justifyContent: 'center',
		gap: 12,
		backgroundColor: '#fff',
	},
	loaderText: { fontSize: 14, color: '#666' },
});
