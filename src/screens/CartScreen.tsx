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
      <Image source={{ uri: item.image }} style={styles.itemImage} resizeMode="contain" />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.itemPrice}>
          {item.price.toLocaleString('vi-VN')} đ
        </Text>
        <View style={styles.qtyRow}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => changeQty(item.id, -1)}
          >
            <Text style={styles.qtyBtnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.qtyValue}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => changeQty(item.id, 1)}
          >
            <Text style={styles.qtyBtnText}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeBtn}
            onPress={() => removeItem(item.id)}
          >
            <Text style={styles.removeBtnText}>Xoá</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>GIỎ HÀNG</Text>
          <Text style={styles.roomSubtitle}>Giao đến {ROOM_LABEL}</Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={styles.clearBtn}>
            <Text style={styles.clearBtnText}>Xoá tất cả</Text>
          </TouchableOpacity>
        )}
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

          <View style={styles.divider} />

          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Tổng hàng:</Text>
            <Text style={styles.totalValue}>
              {totalAmount.toLocaleString('vi-VN')} đ
            </Text>
          </View>

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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.primary,
  },
  roomSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  clearBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  clearBtnText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
  },
  listContent: {
    padding: SPACING.sm,
    paddingBottom: SPACING.lg,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.sm,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  itemImage: {
    width: 65,
    height: 65,
    borderRadius: RADIUS.sm,
    backgroundColor: '#FFFFFF',
  },
  itemInfo: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginTop: 2,
  },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  qtyValue: {
    marginHorizontal: 10,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },
  removeBtn: {
    marginLeft: 'auto',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  removeBtnText: {
    fontSize: 12,
    color: COLORS.error,
    fontWeight: '600',
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
    backgroundColor: '#F8FAFC',
    borderRadius: RADIUS.sm,
    padding: SPACING.sm,
    marginBottom: SPACING.xs,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  shipRoomText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  shipFeeText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textLight,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  orderBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  orderBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
