import React from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Haptics from 'expo-haptics';

import { COLORS, RADIUS, SPACING } from '@constants/theme';
import {
  STUDENT,
  STALE_TIME_MS,
  VARIANT,
  ROOM_LABEL,
} from '@constants/student';
import { fetchProductById, Product } from '@services/productApi';
import { useCartStore } from '@stores/cartStore';
import { Watermark } from '@components/Watermark';
import { ShopStackParamList } from '@navigation/ShopStack';

export function DetailScreen() {
  const insets = useSafeAreaInsets();
  const route = useRoute<RouteProp<ShopStackParamList, 'Detail'>>();
  const { id } = route.params;

  const addItem = useCartStore((state) => state.addItem);
  const queryClient = useQueryClient();
  const cachedProduct = queryClient
    .getQueryData<Product[]>(['products'])
    ?.find((p) => String(p.id) === String(id));

  const {
    data: product,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    initialData: cachedProduct,
    staleTime: STALE_TIME_MS,
  });

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      if (VARIANT.hapticOnAdd === 'impact') {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        await Haptics.selectionAsync();
      }
    } catch {
      // Haptic fallback
    }

    addItem({
      id: product.id,
      title: product.title,
      price: product.price,
      image: product.image,
    });

    Alert.alert('KTXGo', `Đã thêm vào giỏ! (MSSV: ${STUDENT.mssv})`);
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết món #{id}...</Text>
      </View>
    );
  }

  if (isError || !product) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorIcon}>⚠️</Text>
        <Text style={styles.errorTitle}>Lỗi tải chi tiết món</Text>
        <Text style={styles.errorSub}>
          MSSV: {STUDENT.mssv} • {error instanceof Error ? error.message : 'Không tìm thấy món'}
        </Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formattedPrice =
    product.price.toLocaleString('vi-VN') + ' đ';

  return (
    <View style={[styles.safeArea, { paddingBottom: insets.bottom }]}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageCard}>
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{product.category.toUpperCase()}</Text>
            </View>
            <View style={styles.roomBadge}>
              <Text style={styles.roomText}>Giao tận: {ROOM_LABEL}</Text>
            </View>
          </View>

          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formattedPrice}</Text>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>Mô tả món</Text>
          <Text style={styles.description}>{product.description}</Text>

          <View style={styles.studentInfoCard}>
            <Text style={styles.studentInfoTitle}>Thông tin kiểm tra TH2</Text>
            <Text style={styles.studentInfoText}>MSSV: {STUDENT.mssv}</Text>
            <Text style={styles.studentInfoText}>Họ tên: {STUDENT.hoTen}</Text>
            <Text style={styles.studentInfoText}>Presentation: {VARIANT.detailPresentation}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footerBar}>
        <View style={styles.priceContainer}>
          <Text style={styles.footerPriceLabel}>Đơn giá</Text>
          <Text style={styles.footerPriceValue}>{formattedPrice}</Text>
        </View>
        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.85}
        >
          <Text style={styles.addToCartBtnText}>Thêm vào giỏ</Text>
        </TouchableOpacity>
      </View>

      {!VARIANT.watermarkAtTop && <Watermark />}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: RADIUS.lg,
    height: 260,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  image: {
    width: '85%',
    height: '85%',
  },
  content: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: '#E0E7FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  roomBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  roomText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    lineHeight: 24,
    marginBottom: SPACING.xs,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: COLORS.textLight,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  studentInfoCard: {
    backgroundColor: COLORS.background,
    padding: SPACING.sm,
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  studentInfoTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  studentInfoText: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  footerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  priceContainer: {
    flex: 1,
  },
  footerPriceLabel: {
    fontSize: 11,
    color: COLORS.textLight,
  },
  footerPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: RADIUS.md,
    elevation: 2,
  },
  addToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorIcon: {
    fontSize: 44,
    marginBottom: SPACING.xs,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.error,
  },
  errorSub: {
    fontSize: 13,
    color: COLORS.textLight,
    textAlign: 'center',
    marginVertical: SPACING.sm,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
