import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, RADIUS, SPACING } from '@constants/theme';
import { STUDENT, ROOM_LABEL, VARIANT } from '@constants/student';
import { useCartStore, CartItem } from '@stores/cartStore';
import { useLocationStore } from '@hooks/useCampusLocation';
import { Watermark } from '@components/Watermark';

export function CartScreen() {
  const insets = useSafeAreaInsets();
  const { items, changeQty, removeItem, clearCart } = useCartStore();
  const { shipFee, distanceKm } = useLocationStore();

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalAmount = subtotal + (shipFee || 0);

  const handleOrder = () => {
    if (items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng chọn món trước khi đặt.');
      return;
    }

    Alert.alert(
      'Đặt giao tận phòng thành công!',
      `Đơn hàng KTXGo sẽ được giao đến ${ROOM_LABEL}.\n` +
        `Sinh viên: ${STUDENT.hoTen} (${STUDENT.mssv})\n` +
        `Tổng thanh toán: ${totalAmount.toLocaleString('vi-VN')} đ\n` +
        (shipFee ? `(Phí ship: ${shipFee.toLocaleString('vi-VN')} đ - ${distanceKm} km)` : '(Chưa tính ship GPS)')
    );
    clearCart();
  };

  const renderCartItem = ({ item }: { item: CartItem }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>
          ×{item.quantity} {(item.price * item.quantity).toLocaleString('vi-VN')} đ
        </Text>
      </View>
      <TouchableOpacity
        style={styles.removeBtn}
        onPress={() => removeItem(item.id)}
        activeOpacity={0.8}
      >
        <Text style={styles.removeBtnText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.header}>
        <Text style={styles.headerTitle}>GIỎ HÀNG</Text>
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
          <Text style={styles.emptySub}>
            Hãy quay lại tab Cửa hàng và chọn món cho phòng {ROOM_LABEL} nhé!
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => `cart-${STUDENT.mssv}-${item.id}`}
          renderItem={renderCartItem}
          contentContainerStyle={styles.listContent}
        />
      )}

      {items.length > 0 && (
        <View style={styles.summaryCard}>
          <View style={styles.shipBox}>
            <Text style={styles.shipRoomText}>Giao đến {ROOM_LABEL}</Text>
            <Text style={styles.shipFeeText}>
              {shipFee !== null
                ? `Phí ship: ${shipFee.toLocaleString('vi-VN')} đ (công thức ${VARIANT.shipFormula})`
                : 'Chưa ước tính phí — mở tab Tôi'}
            </Text>
          </View>

          <Text style={styles.totalText}>
            Tổng hàng: {totalAmount.toLocaleString('vi-VN')} đ
          </Text>

          <TouchableOpacity
            style={styles.orderBtn}
            onPress={handleOrder}
            activeOpacity={0.85}
          >
            <Text style={styles.orderBtnText}>
              Đặt giao tận phòng {ROOM_LABEL}
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textLight,
    marginTop: 4,
  },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: SPACING.sm,
  },
  removeBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  emptyIcon: {
    fontSize: 50,
    marginBottom: SPACING.sm,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  emptySub: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  shipBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
  },
  shipRoomText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  shipFeeText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.secondary,
    marginTop: 4,
  },
  totalText: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
