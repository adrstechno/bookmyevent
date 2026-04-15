import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppToast } from "@/components/common/AppToastProvider";
import { ThemedText } from "@/components/themed-text";
import { forgotPassword } from "@/services/auth/authApi";
import { useAppTheme } from "@/theme/useAppTheme";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { showError, showSuccess } = useAppToast();
  const { palette, isDark } = useAppTheme();

  const validate = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Enter a valid email address");
      return false;
    }
    setError("");
    return true;
  };

  const onSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const msg = await forgotPassword(email.trim().toLowerCase());
      setEmailSent(true);
      setError("");
      showSuccess(msg || "Password reset link sent! Check your email.");
    } catch (err) {
      const fallback = "Failed to send reset link. Please try again.";
      const msg =
        err &&
        typeof err === "object" &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : fallback;
      setError(msg);
      showError(msg);
    } finally {
      setLoading(false);
    }
  };

  const c = palette;

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: c.screenBg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoWrap}>
          <Image
            source={require("@/assets/images/login_logo.png")}
            style={styles.brandLogo}
            resizeMode="contain"
          />
        </View>
        <ThemedText style={[styles.title, { color: palette.text }]}> 
          Forgot Password
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: palette.subtext }]}> 
          Enter your account email to receive password reset instructions.
        </ThemedText>

        <View
          style={[
            styles.card,
            { backgroundColor: palette.surfaceBg, borderColor: palette.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              {
                color: palette.text,
                borderColor: palette.border,
                backgroundColor: palette.headerBtnBg,
              },
            ]}
            placeholder="Email"
            placeholderTextColor={palette.subtext}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          {error ? (
            <ThemedText style={[styles.errorText, { color: palette.danger }]}> 
              {error}
            </ThemedText>
          ) : null}
          {emailSent ? (
            <ThemedText style={[styles.messageText, { color: "#0F766E" }]}> 
              Reset instructions have been sent. Please check your email.
            </ThemedText>
          ) : null}

          <Pressable
            style={[
              styles.primaryBtn,
              { backgroundColor: palette.tint },
              loading && styles.primaryBtnDisabled,
            ]}
            onPress={onSubmit}
            disabled={loading}
          >
            <ThemedText style={styles.primaryBtnText}>
              {loading ? "Sending..." : "Send Reset Link"}
            </ThemedText>
          </Pressable>

          <Pressable
            style={styles.linkBtn}
            onPress={() => router.replace("/(auth)/login")}
          >
            <ThemedText style={[styles.linkText, { color: palette.tint }]}>
              Back to Login
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 12,
    paddingBottom: 36,
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  logoWrap: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    width: 200,
    height: 120,
    borderRadius: 18,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  logoPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#FDE7EF",
  },
  logoPillText: {
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: "800",
  },
  brand: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 21,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  icon: { marginRight: 10 },

  errText: { fontSize: 12, fontWeight: "600", marginTop: -10 },

  primaryBtn: {
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  primaryBtnDisabled: { opacity: 0.55 },
  primaryBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },

  switchWrap: { alignItems: "center", paddingTop: 2 },
  switchText: { fontSize: 14, textAlign: "center" },
  switchLink: { fontWeight: "700" },
  linkBtn: { alignItems: "center", paddingVertical: 12 },

  successBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 14,
  },
  successTitle: { fontSize: 15, fontWeight: "700" },
  successBody: { fontSize: 13 },
  successEmail: { fontWeight: "700" },

  stepsCard: { borderRadius: 12, padding: 14, gap: 8 },
  stepsTitle: { fontSize: 14, fontWeight: "700", marginBottom: 2 },
  stepRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  stepText: { fontSize: 13, flex: 1 },
  spamNote: { fontSize: 12, marginTop: 4 },
  tryAgain: { fontWeight: "700" },

  outlineBtn: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  linkText: {
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "700",
  },
  messageText: {
    fontSize: 12,
    fontWeight: "700",
  },
  outlineBtnText: { fontSize: 16, fontWeight: "700" },
});
