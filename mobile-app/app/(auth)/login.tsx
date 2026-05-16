import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/themed-text";
import { useAppToast } from "@/components/common/AppToastProvider";
import { resendVerificationEmail } from "@/services/auth/authApi";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  clearAuthError,
  loginWithCredentials,
  registerWithCredentials,
  type LoginErrorPayload,
} from "@/store/slices/authSlice";
import { useAppTheme } from "@/theme/useAppTheme";
import { getRoleHomeRoute } from "@/utils/authRole";

const ROLE_OPTIONS = [
  { key: "user", label: "User" },
  { key: "vendor", label: "Vendor" },
] as const;

type AuthMode = "login" | "register";
type RoleType = "user" | "vendor";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { showError, showSuccess } = useAppToast();
  const {
    isAuthenticated,
    isHydrated,
    isLoading,
    error,
    role: authRole,
  } = useAppSelector((state) => state.auth);
  const { palette, resolvedMode } = useAppTheme();
  const isDark = resolvedMode === "dark";

  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<RoleType>("user");
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const transition = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    dispatch(clearAuthError());
    setLocalError("");
  }, [dispatch]);

  useEffect(() => {
    transition.setValue(0);
    Animated.timing(transition, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [mode, transition]);

  const subtitle = useMemo(() => {
    return mode === "login"
      ? "Sign in to continue."
      : "Create your account to get started.";
  }, [mode]);

  if (isHydrated && isAuthenticated) {
    return <Redirect href={getRoleHomeRoute(authRole)} />;
  }

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setLocalError("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setPassword("");
    setShowPassword(false);
    dispatch(clearAuthError());
  };

  const validate = () => {
    setLocalError("");

    // Email validation
    if (!email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError("Enter a valid email address");
      return false;
    }

    // Password validation
    if (!password.trim()) {
      setLocalError("Password is required");
      return false;
    }
    if (password.trim().length < 6) {
      setLocalError("Password must be at least 6 characters");
      return false;
    }

    // Registration-specific validation
    if (mode === "register") {
      if (!phone.trim()) {
        setLocalError("Phone number is required");
        return false;
      }
      if (!/^[6-9]\d{9}$/.test(phone.trim())) {
        setLocalError("Enter a valid 10-digit phone number");
        return false;
      }
    }

    return true;
  };

  const handleResendVerification = async (targetEmail: string) => {
    try {
      const resendMessage = await resendVerificationEmail(
        targetEmail.trim().toLowerCase(),
      );
      showSuccess(
        resendMessage || "Verification email sent. Please check your inbox.",
      );
    } catch (resendError) {
      const message =
        resendError &&
        typeof resendError === "object" &&
        "message" in resendError
          ? String((resendError as { message?: unknown }).message ?? "")
          : "";
      showError(
        message || "Failed to resend verification email. Please try again.",
      );
    }
  };

  const onSubmit = async () => {
    dispatch(clearAuthError());

    if (!validate()) {
      // Focus on the first error field if needed
      return;
    }

    if (mode === "login") {
      try {
        await dispatch(
          loginWithCredentials({
            email: email.trim().toLowerCase(),
            password: password.trim(),
          }),
        ).unwrap();
        showSuccess("Login successful!");
      } catch (err) {
        const loginError =
          typeof err === "string"
            ? ({ message: err } as LoginErrorPayload)
            : (err as LoginErrorPayload);
        const message =
          loginError?.message || "Login failed. Please try again.";
        setLocalError(message);
        showError(message);

        if (loginError?.requiresVerification) {
          const targetEmail = loginError.email || email.trim().toLowerCase();
          Alert.alert(
            "Email Verification Required",
            "Would you like to resend the verification email?",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Resend",
                onPress: () => {
                  void handleResendVerification(targetEmail);
                },
              },
            ],
          );
        }
      }
      return;
    }

    // Register mode
    try {
      const registerResult = await dispatch(
        registerWithCredentials({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim(),
          phone: phone.trim(),
          userType: role,
        }),
      ).unwrap();
      showSuccess(
        registerResult.message ?? "Registration successful. Please sign in.",
      );
      setMode("login");
      setPassword("");
      setLocalError("");
    } catch (err) {
      const message =
        typeof err === "string"
          ? err
          : "Registration failed. Please try again.";
      setLocalError(message);
      showError(message);
    }
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.screenBg }]}
      edges={["top", "bottom"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
      <ScrollView
        style={[styles.page, { backgroundColor: palette.screenBg }]}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View style={styles.logoWrap}>
            <Image
              source={require("@/assets/images/login_logo.png")}
              style={styles.brandLogo}
              resizeMode="contain"
            />
          </View>
          <ThemedText style={[styles.title, { color: palette.text }]}> 
            {mode === "login" ? "Welcome Back" : "Join Us"}
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: palette.subtext }]}> 
            {subtitle}
          </ThemedText>
        </View>
        {/* Auth Mode Tabs */}
        <View
          style={[styles.modeTabs, { backgroundColor: palette.elevatedBg }]}
        >
          <Pressable
            style={[
              styles.modeTab,
              mode === "login" && [
                styles.modeTabActive,
                { backgroundColor: palette.primary },
              ],
            ]}
            onPress={() => switchMode("login")}
          >
            <ThemedText
              style={[
                styles.modeTabText,
                mode === "login"
                  ? { color: palette.onPrimary, fontWeight: "700" }
                  : { color: palette.subtext },
              ]}
            >
              Login
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.modeTab,
              mode === "register" && [
                styles.modeTabActive,
                { backgroundColor: palette.primary },
              ],
            ]}
            onPress={() => switchMode("register")}
          >
            <ThemedText
              style={[
                styles.modeTabText,
                mode === "register"
                  ? { color: palette.onPrimary, fontWeight: "700" }
                  : { color: palette.subtext },
              ]}
            >
              Register
            </ThemedText>
          </Pressable>
        </View>

        {/* Form Fields */}
        <Animated.View
          style={[
            styles.section,
            styles.formPanel,
            { borderColor: palette.border, backgroundColor: palette.surfaceBg },
            {
              opacity: transition,
              transform: [
                {
                  translateY: transition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [10, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {mode === "register" && (
            <>
              <ThemedText style={[styles.label, { color: palette.text }]}>
                Select Role
              </ThemedText>
              <View style={styles.roleGrid}>
                {ROLE_OPTIONS.map((option) => (
                  <Pressable
                    key={option.key}
                    style={[
                      styles.roleButton,
                      {
                        backgroundColor: palette.elevatedBg,
                        borderColor:
                          role === option.key
                            ? palette.primary
                            : palette.border,
                      },
                      role === option.key && { borderWidth: 2 },
                    ]}
                    onPress={() => setRole(option.key)}
                  >
                    <ThemedText
                      style={[
                        styles.roleButtonText,
                        {
                          color:
                            role === option.key
                              ? palette.primary
                              : palette.subtext,
                        },
                      ]}
                    >
                      {option.label}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          )}
          {/* Name Fields (Register only) */}
          {mode === "register" && (
            <>
              <View style={styles.nameRow}>
                <TextInput
                  style={[
                    styles.inputHalf,
                    {
                      backgroundColor: palette.elevatedBg,
                      borderColor: palette.border,
                      color: palette.text,
                    },
                  ]}
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First Name (optional)"
                  placeholderTextColor={palette.muted}
                />
                <TextInput
                  style={[
                    styles.inputHalf,
                    {
                      backgroundColor: palette.elevatedBg,
                      borderColor: palette.border,
                      color: palette.text,
                    },
                  ]}
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last Name (optional)"
                  placeholderTextColor={palette.muted}
                />
              </View>
            </>
          )}
          {/* Email Input */}
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: palette.elevatedBg,
                borderColor: palette.border,
                color: palette.text,
              },
            ]}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={palette.muted}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!isLoading}
          />

          {/* Phone Input (Register only) */}
          {mode === "register" && (
            <>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: palette.elevatedBg,
                    borderColor: palette.border,
                    color: palette.text,
                  },
                ]}
                value={phone}
                onChangeText={(t) => setPhone(t.replace(/\D/g, "").slice(0, 10))}
                placeholder="Phone Number (10 digits)"
                placeholderTextColor={palette.muted}
                keyboardType="phone-pad"
                maxLength={10}
                editable={!isLoading}
              />
              {phone.length > 0 && phone.length < 10 && (
                <ThemedText style={[styles.phoneHint, { color: palette.subtext }]}>
                  {10 - phone.length} more digit{10 - phone.length !== 1 ? "s" : ""} needed
                </ThemedText>
              )}
            </>
          )}

          {/* Password Input */}
          <View style={[
            styles.passwordWrapper,
            {
              backgroundColor: palette.elevatedBg,
              borderColor: palette.border,
            },
          ]}>
            <TextInput
              style={[
                styles.passwordInput,
                { color: palette.text },
              ]}
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={palette.muted}
              secureTextEntry={!showPassword}
              editable={!isLoading}
              autoCapitalize="none"
            />
            <Pressable
              onPress={() => setShowPassword((prev) => !prev)}
              style={styles.eyeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={palette.muted}
              />
            </Pressable>
          </View>

          {/* Forgot Password Link (Login only) */}
          {mode === "login" && (
            <Pressable
              style={styles.forgotPasswordBtn}
              onPress={() => router.push("/(auth)/forgot-password")}
              disabled={isLoading}
            >
              <ThemedText
                style={[styles.forgotPasswordText, { color: palette.primary }]}
              >
                Forgot password?
              </ThemedText>
            </Pressable>
          )}

          {/* Error Messages */}
          {localError && (
            <ThemedText
              style={[styles.errorMessage, { color: palette.danger }]}
            >
              {localError}
            </ThemedText>
          )}

          {/* Submit Button */}
          <Pressable
            style={[
              styles.submitButton,
              { backgroundColor: palette.primary },
              isLoading && styles.submitButtonDisabled,
            ]}
            onPress={() => { void onSubmit(); }}
            disabled={isLoading}
          >
            <ThemedText
              style={[styles.submitButtonText, { color: palette.onPrimary }]}
            >
              {isLoading
                ? "..."
                : mode === "login"
                  ? "Login"
                  : "Create Account"}
            </ThemedText>
          </Pressable>

        </Animated.View>
      </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  page: {
    flex: 1,
  },
  container: {
    padding: 20,
    gap: 20,
    paddingBottom: 36,
  },
  headerSection: {
    gap: 8,
    marginBottom: 12,
    alignItems: "center",
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    marginTop: 12,
    width: 200,
    height: 120,
    borderRadius: 18,
    backgroundColor: "transparent",
    borderWidth: 0,
  },
  brandLogo: {
    width: "100%",
    height: "100%",
    borderRadius: 18,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    lineHeight: 30,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    maxWidth: 300,
  },
  modeTabs: {
    flexDirection: "row",
    gap: 8,
    padding: 4,
    borderRadius: 12,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modeTabActive: {},
  modeTabText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    gap: 14,
  },
  formPanel: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  roleGrid: {
    flexDirection: "row",
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
  },
  roleButtonText: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  nameRow: {
    flexDirection: "row",
    gap: 12,
  },
  inputHalf: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 48,
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    minHeight: 48,
    fontSize: 15,
  },
  passwordWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    minHeight: 48,
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    fontSize: 15,
  },
  eyeBtn: {
    paddingLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  phoneHint: {
    fontSize: 11,
    marginTop: -8,
    paddingHorizontal: 4,
  },
  forgotPasswordBtn: {
    alignSelf: "flex-end",
  },
  forgotPasswordText: {
    fontSize: 13,
    fontWeight: "600",
  },
  errorMessage: {
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  submitButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginVertical: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  footerText: {
    fontSize: 13,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: "700",
  },
  footerLinkSpacing: {
    marginLeft: 4,
  },
});
