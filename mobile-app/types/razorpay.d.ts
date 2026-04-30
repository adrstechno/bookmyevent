declare module 'react-native-razorpay' {
	export type RazorpayCheckoutOptions = {
		key: string;
		amount: number;
		currency: string;
		name: string;
		description?: string;
		order_id: string;
		prefill?: {
			name?: string;
			email?: string;
			contact?: string;
		};
		theme?: {
			color?: string;
		};
	};

	export type RazorpayPaymentSuccess = {
		razorpay_order_id: string;
		razorpay_payment_id: string;
		razorpay_signature: string;
	};

	export type RazorpayPaymentError = {
		code?: number | string;
		description?: string;
		reason?: string;
	};

	const RazorpayCheckout: {
		open(options: RazorpayCheckoutOptions): Promise<RazorpayPaymentSuccess>;
	};

	export default RazorpayCheckout;
}
