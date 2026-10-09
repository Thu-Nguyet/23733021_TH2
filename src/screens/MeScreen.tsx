import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '@constants/theme';
import {
  STUDENT,
  ROOM_LABEL,
  BASE_SHIP_FEE,
  VARIANT,
  LAST_DIGIT,
  examStamp,
} from '@constants/student';
import { useAuthStore } from '@stores/authStore';
import {
  useCampusLocation,
  KTX_GATE_COORDS,
} from '@hooks/useCampusLocation';
import { Watermark } from '@components/Watermark';

export function MeScreen() {
  const insets = useSafeAreaInsets();
  const token = useAuthStore((state) => state.token);
  const logout = useAuthStore((state) => state.logout);
  const {
    coords,
    distanceKm,
    shipFee,
    permissionStatus,
    loading,
    requestLocation,
    openSettings,
  } = useCampusLocation();

  const handleLogout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc chắn muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const tokenShort = token
    ? `${token.slice(0, 12)}...${token.slice(-6)}`
    : 'Chưa có';

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>TÔI · LOCATION</Text>
      </View>

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Profile Info - clean text without card box as shown in Hình 5 */}
        <View style={styles.profileSection}>
          <Text style={styles.studentName}>{STUDENT.hoTen}</Text>
          <View style={styles.profileSubRow}>
            <Text style={styles.studentMssv}>{STUDENT.mssv}</Text>
            <Text style={styles.dotSeparator}>·</Text>
            <Text style={styles.stampText}>#{examStamp()}</Text>
          </View>
        </View>

        {/* Location & GPS shipping fee card */}
        <View style={styles.card}>
          <Text style={styles.statusRow}>
            <Text style={styles.statusLabel}>Quyền: </Text>
            <Text
              style={[
                styles.statusValue,
                permissionStatus === 'granted'
                  ? styles.textSuccess
                  : permissionStatus === 'blocked'
                  ? styles.textError
                  : styles.textWarning,
              ]}
            >
              {permissionStatus}
            </Text>
          </Text>

          {loading ? (
            <View style={styles.inlineLoading}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.loadingText}>Đang lấy tọa độ GPS...</Text>
            </View>
          ) : (
            <View style={styles.locationInfoBox}>
              <Text style={styles.distanceText}>
                ≈ {distanceKm ?? 1.2} km tới cổng KTX
              </Text>
              <Text style={styles.feeTitle}>Phí ship ước tính</Text>
              <Text style={styles.feeHighlight}>
                {(shipFee ?? 12000).toLocaleString('vi-VN')} đ
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons Stack (Exactly as in Hình 5) */}
        <TouchableOpacity
          style={styles.actionBtnPrimary}
          onPress={requestLocation}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnPrimaryText}>
            Lấy vị trí ước tính ship
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtnBlocked}
          onPress={openSettings}
          activeOpacity={0.85}
        >
          <Text style={styles.actionBtnBlockedText}>
            Mở Cài đặt (blocked)
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={styles.logoutBtnText}>Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>

      {!VARIANT.watermarkAtTop && <Watermark />}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  profileSection: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  studentName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E3A8A',
    textAlign: 'center',
  },
  profileSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  studentMssv: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  dotSeparator: {
    fontSize: 14,
    color: '#6B7280',
    marginHorizontal: 6,
  },
  stampText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6B7280',
  },
  card: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  statusRow: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  textSuccess: {
    color: COLORS.success,
  },
  textError: {
    color: COLORS.error,
  },
  textWarning: {
    color: '#D97706',
  },
  inlineLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.xs,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 13,
    color: COLORS.textLight,
  },
  locationInfoBox: {
    marginTop: 4,
  },
  distanceText: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    marginBottom: 8,
  },
  feeTitle: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  feeHighlight: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.secondary,
    marginTop: 2,
  },
  actionBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
    elevation: 2,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionBtnBlocked: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  actionBtnBlockedText: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    elevation: 2,
  },
  logoutBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
