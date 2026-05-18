import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FadeInView from "@/components/common/FadeInView";
import { StackHeader } from "@/components/layout/StackHeader";
import { ThemedText } from "@/components/themed-text";
import {
  fetchVendorById,
  fetchVendorPackages,
} from "@/services/catalog/catalogService";
import { createBooking } from "@/services/booking/bookingService";
import {
  fetchAvailableShifts,
  formatDateParam,
  type AvailableShift,
} from "@/services/vendor/reservationService";
import type { VendorPackage, VendorSummary } from "@/types/catalog";
import { useSettingsTheme } from "@/theme/settingsTheme";

type BookingFormState = {
  packageId: string;
  shiftId: string;
  eventDate: string;
  eventTime: string;
  eventAddress: string;
  specialRequirement: string;
};

const TODAY = formatDateParam(new Date());

export default function VendorBookingScreen() {
  const router = useRouter();
  const { palette, mode } = useSettingsTheme();
  const params = useLocalSearchParams<{
    vendorId?: string;
    vendorName?: string;
    packageId?: string;
    packageName?: string;
  }>();

  const vendorId = typeof params.vendorId === "string" ? params.vendorId : "";
  const initialPackageId =
    typeof params.packageId === "string" ? params.packageId : "";
  const initialVendorName =
    typeof params.vendorName === "string" ? params.vendorName : "Vendor";

  const [vendor, setVendor] = useState<VendorSummary | null>(null);
  const [packages, setPackages] = useState<VendorPackage[]>([]);
  const [availableShifts, setAvailableShifts] = useState<AvailableShift[]>([]);
  const [form, setForm] = useState<BookingFormState>({
    packageId: initialPackageId,
    shiftId: "",
    eventDate: TODAY,
    eventTime: "",
    eventAddress: "",
    specialRequirement: "",
  });
  const [loading, setLoading] = useState(true);
  const [shiftsLoading, setShiftsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const heading = useMemo(
    () => vendor?.businessName || initialVendorName || "Book Vendor",
    [vendor?.businessName, initialVendorName],
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      if (!vendorId) {
        setError("Missing vendor identifier.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const [vendorData, vendorPackages] = await Promise.all([
          fetchVendorById(vendorId),
          fetchVendorPackages(vendorId),
        ]);

        if (!active) {
          return;
        }

        setVendor(vendorData);
        setPackages(vendorPackages);

        if (!initialPackageId && vendorPackages.length > 0) {
          setForm((prev) => ({
            ...prev,
            packageId: String(vendorPackages[0].packageId),
          }));
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load booking details.",
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [initialPackageId, vendorId]);

  useEffect(() => {
    let active = true;

    const loadShifts = async () => {
      if (!vendorId || !form.eventDate) {
        setAvailableShifts([]);
        return;
      }

      setShiftsLoading(true);
      try {
        const shifts = await fetchAvailableShifts(
          vendorId,
          new Date(form.eventDate),
        );
        if (active) {
          setAvailableShifts(shifts);
          setForm((prev) => {
            if (
              prev.shiftId &&
              shifts.some(
                (shift) => String(shift.shift_id) === String(prev.shiftId),
              )
            ) {
              return prev;
            }

            return {
              ...prev,
              shiftId: shifts[0] ? String(shifts[0].shift_id) : "",
            };
          });
        }
      } catch {
        if (active) {
          setAvailableShifts([]);
        }
      } finally {
        if (active) {
          setShiftsLoading(false);
        }
      }
    };

    void loadShifts();

    return () => {
      active = false;
    };
  }, [form.eventDate, vendorId]);

  const updateField = (field: keyof BookingFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (
      !vendorId ||
      !form.packageId ||
      !form.shiftId ||
      !form.eventAddress.trim() ||
      !form.eventDate ||
      !form.eventTime
    ) {
      setError(
        "Please complete package, shift, date, time, and address before booking.",
      );
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const result = await createBooking({
        vendor_id: vendorId,
        shift_id: form.shiftId,
        package_id: form.packageId,
        event_address: form.eventAddress.trim(),
        event_date: form.eventDate,
        event_time: form.eventTime,
        special_requirement: form.specialRequirement.trim(),
      });

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      router.replace("/(tabs)/bookings");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPackage =
    packages.find(
      (item) => String(item.packageId) === String(form.packageId),
    ) ?? null;

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: palette.screenBg }]}
      >
        <StatusBar style={mode === "dark" ? "light" : "dark"} />
        <StackHeader title="Book Vendor" />
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color={palette.primary} />
          <ThemedText style={[styles.stateText, { color: palette.subtext }]}>
            Loading booking details...
          </ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: palette.screenBg }]}
    >
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <View style={[styles.page, { backgroundColor: palette.screenBg }]}>
        <StackHeader title="Book Vendor" />
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <FadeInView>
            <View
              style={[
                styles.heroCard,
                {
                  backgroundColor: palette.surfaceBg,
                  borderColor: palette.border,
                },
              ]}
            >
              <ThemedText style={[styles.heroTitle, { color: palette.text }]}>
                {heading}
              </ThemedText>
              <ThemedText
                style={[styles.heroSubtitle, { color: palette.subtext }]}
              >
                Choose a package, date, and an available shift to send a booking
                request.
              </ThemedText>
            </View>
          </FadeInView>

          {error ? (
            <View
              style={[
                styles.errorCard,
                { borderColor: "#fecaca", backgroundColor: "#fef2f2" },
              ]}
            >
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          ) : null}

          <FadeInView delay={50}>
            <View
              style={[
                styles.formCard,
                {
                  backgroundColor: palette.surfaceBg,
                  borderColor: palette.border,
                },
              ]}
            >
              <ThemedText
                style={[styles.sectionTitle, { color: palette.text }]}
              >
                Booking Details
              </ThemedText>

              <ThemedText style={[styles.fieldLabel, { color: palette.text }]}>
                Package
              </ThemedText>
              <View style={styles.optionList}>
                {packages.length > 0 ? (
                  packages.map((item) => {
                    const selected =
                      String(item.packageId) === String(form.packageId);
                    return (
                      <Pressable
                        key={item.packageId}
                        style={({ pressed }) => [
                          styles.optionChip,
                          {
                            borderColor: selected
                              ? palette.primary
                              : palette.border,
                            backgroundColor: selected
                              ? `${palette.primary}18`
                              : palette.screenBg,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                        onPress={() =>
                          updateField("packageId", String(item.packageId))
                        }
                      >
                        <ThemedText
                          style={[styles.optionTitle, { color: palette.text }]}
                        >
                          {item.packageName}
                        </ThemedText>
                        <ThemedText
                          style={[styles.optionSub, { color: palette.subtext }]}
                        >
                          {item.packageDescription ||
                            "Package details available on request."}
                        </ThemedText>
                      </Pressable>
                    );
                  })
                ) : (
                  <ThemedText
                    style={[styles.helperText, { color: palette.subtext }]}
                  >
                    No packages available for this vendor.
                  </ThemedText>
                )}
              </View>

              <ThemedText style={[styles.fieldLabel, { color: palette.text }]}>
                Event Date
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: palette.border,
                    color: palette.text,
                    backgroundColor: palette.screenBg,
                  },
                ]}
                value={form.eventDate}
                onChangeText={(value) => updateField("eventDate", value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={palette.subtext}
              />

              <ThemedText style={[styles.fieldLabel, { color: palette.text }]}>
                Available Shift
              </ThemedText>
              {shiftsLoading ? (
                <View style={styles.inlineLoading}>
                  <ActivityIndicator size="small" color={palette.primary} />
                  <ThemedText
                    style={[styles.helperText, { color: palette.subtext }]}
                  >
                    Loading shifts...
                  </ThemedText>
                </View>
              ) : availableShifts.length > 0 ? (
                <View style={styles.optionList}>
                  {availableShifts.map((shift) => {
                    const selected =
                      String(shift.shift_id) === String(form.shiftId);
                    return (
                      <Pressable
                        key={shift.shift_id}
                        style={({ pressed }) => [
                          styles.optionChip,
                          {
                            borderColor: selected
                              ? palette.primary
                              : palette.border,
                            backgroundColor: selected
                              ? `${palette.primary}18`
                              : palette.screenBg,
                            opacity: pressed ? 0.85 : 1,
                          },
                        ]}
                        onPress={() =>
                          updateField("shiftId", String(shift.shift_id))
                        }
                      >
                        <ThemedText
                          style={[styles.optionTitle, { color: palette.text }]}
                        >
                          {shift.shift_name}
                        </ThemedText>
                        <ThemedText
                          style={[styles.optionSub, { color: palette.subtext }]}
                        >
                          {" "}
                          {shift.time_display ||
                            `${shift.start_time.slice(0, 5)} - ${shift.end_time.slice(0, 5)}`}
                        </ThemedText>
                      </Pressable>
                    );
                  })}
                </View>
              ) : (
                <ThemedText
                  style={[styles.helperText, { color: palette.subtext }]}
                >
                  No available shifts for this date. Try another date.
                </ThemedText>
              )}

              <ThemedText style={[styles.fieldLabel, { color: palette.text }]}>
                Event Time
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    borderColor: palette.border,
                    color: palette.text,
                    backgroundColor: palette.screenBg,
                  },
                ]}
                value={form.eventTime}
                onChangeText={(value) => updateField("eventTime", value)}
                placeholder="HH:MM"
                placeholderTextColor={palette.subtext}
              />

              <ThemedText style={[styles.fieldLabel, { color: palette.text }]}>
                Event Address
              </ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    borderColor: palette.border,
                    color: palette.text,
                    backgroundColor: palette.screenBg,
                  },
                ]}
                value={form.eventAddress}
                onChangeText={(value) => updateField("eventAddress", value)}
                placeholder="Enter complete event address"
                placeholderTextColor={palette.subtext}
                multiline
              />

              <ThemedText style={[styles.fieldLabel, { color: palette.text }]}>
                Special Requirement
              </ThemedText>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    borderColor: palette.border,
                    color: palette.text,
                    backgroundColor: palette.screenBg,
                  },
                ]}
                value={form.specialRequirement}
                onChangeText={(value) =>
                  updateField("specialRequirement", value)
                }
                placeholder="Optional notes for the vendor"
                placeholderTextColor={palette.subtext}
                multiline
              />

              <Pressable
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: palette.primary,
                    opacity: pressed || submitting ? 0.85 : 1,
                  },
                ]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Ionicons name="calendar" size={18} color="#FFFFFF" />
                )}
                <ThemedText style={styles.submitText}>
                  {submitting ? "Booking..." : "Confirm Booking"}
                </ThemedText>
              </Pressable>

              {selectedPackage ? (
                <ThemedText
                  style={[styles.helperText, { color: palette.subtext }]}
                >
                  Selected package: {selectedPackage.packageName}
                </ThemedText>
              ) : null}
            </View>
          </FadeInView>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  page: { flex: 1 },
  content: { padding: 16, gap: 14, paddingBottom: 28 },
  centerState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: { fontSize: 14 },
  heroCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 8 },
  heroTitle: { fontSize: 22, fontWeight: "800" },
  heroSubtitle: { fontSize: 14, lineHeight: 20 },
  errorCard: { borderWidth: 1, borderRadius: 14, padding: 12 },
  errorText: { color: "#b91c1c", fontSize: 13, fontWeight: "600" },
  formCard: { borderWidth: 1, borderRadius: 18, padding: 16, gap: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "800" },
  fieldLabel: { fontSize: 13, fontWeight: "700", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 92,
    textAlignVertical: "top",
  },
  optionList: { gap: 10 },
  optionChip: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 4 },
  optionTitle: { fontSize: 14, fontWeight: "800" },
  optionSub: { fontSize: 12, lineHeight: 17 },
  helperText: { fontSize: 13, lineHeight: 19 },
  inlineLoading: { flexDirection: "row", alignItems: "center", gap: 8 },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 16,
    paddingVertical: 14,
    marginTop: 8,
  },
  submitText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
});
