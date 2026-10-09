import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '@constants/theme';
import { STUDENT, VARIANT, ROOM_LABEL } from '@constants/student';
import { useAuthStore } from '@stores/authStore';
import { Watermark } from '@components/Watermark';

export function LoginScreen() {
  const insets = useSafeAreaInsets();
  const isPhone = VARIANT.authField === 'phone';
  const defaultPlaceholder = isPhone
    ? 'Nhập số điện thoại (VD: 0923733021)'
    : 'Nhập email sinh viên';
  const [credential, setCredential] = useState('');
  const login = useAuthStore((state) => state.login);

  const handleLogin = () => {
    const trimmed = credential.trim();
    if (!trimmed) {
      Alert.alert(
        'Yêu cầu nhập thông tin',
        `Vui lòng nhập ${isPhone ? 'số điện thoại' : 'email'} của bạn để tiếp tục.`
      );
      return;
    }
    login();
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.brandTitle}>KTXGO</Text>
          <Text style={styles.brandSubtitle}>
            Giao đồ tận phòng ký túc xá
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={defaultPlaceholder}
              placeholderTextColor={COLORS.textLight}
              value={credential}
              onChangeText={setCredential}
              keyboardType={isPhone ? 'phone-pad' : 'email-address'}
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={styles.submitBtn}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Text style={styles.submitBtnText}>Vào cửa hàng</Text>
          </TouchableOpacity>

          <Text style={styles.authStackNote}>
            Auth Stack · chưa có token
          </Text>
        </View>
      </KeyboardAvoidingView>

      {!VARIANT.watermarkAtTop && <Watermark />}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  logoBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.sm,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
    letterSpacing: 2,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 4,
  },
  brandSubtitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: 4,
    textAlign: 'center',
  },
  roomBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginTop: 8,
    marginBottom: SPACING.md,
  },
  inputContainer: {
    width: '100%',
    marginBottom: SPACING.lg,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  submitBtn: {
    width: '100%',
    height: 48,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  authStackNote: {
    fontSize: 12,
    color: COLORS.textLight,
    marginTop: SPACING.md,
    fontStyle: 'italic',
  },
});
