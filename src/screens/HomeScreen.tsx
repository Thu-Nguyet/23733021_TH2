import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';

import { COLORS, RADIUS, SPACING } from '@constants/theme';
import {
  STUDENT,
  ROOM_LABEL,
  DEBOUNCE_MS,
  STALE_TIME_MS,
  VARIANT,
} from '@constants/student';
import { useDebouncedValue } from '@hooks/useDebouncedValue';
import { useProductsQuery, Product } from '@services/productApi';
import { ProductCard } from '@components/ProductCard';
import { Watermark } from '@components/Watermark';
import { ShopStackParamList } from '@navigation/ShopStack';

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<ShopStackParamList>>();
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebouncedValue(searchQuery, DEBOUNCE_MS);

  const {
    data: products,
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useProductsQuery();

  const filteredProducts = (products || []).filter((item) =>
    item.title.toLowerCase().includes(debouncedSearch.toLowerCase().trim())
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải món...</Text>
        </View>
      );
    }

    if (isError) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorMssv}>{STUDENT.mssv}</Text>
          <Text style={styles.errorTitle}>Không tải được dữ liệu món.</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.listContainer}>
        <FlashList
          data={filteredProducts}
          keyExtractor={(item) => `${STUDENT.mssv}-${item.id}`}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              onPress={() => navigation.navigate('Detail', { id: String(item.id) })}
            />
          )}
          numColumns={2}
          estimatedItemSize={210}
          contentContainerStyle={styles.flashListContent}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `Không tìm thấy món phù hợp với "${debouncedSearch}"`
                  : 'Hiện chưa có món nào.'}
              </Text>
            </View>
          }
        />
      </View>
    );
  };

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top }]}>
      {VARIANT.watermarkAtTop && <Watermark />}

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>KTXGO</Text>
          <Text style={styles.roomSubtitle}>Giao tận {ROOM_LABEL}</Text>
        </View>
        <View style={styles.badgeMssv}>
          <Text style={styles.badgeMssvText}>{STUDENT.mssv}</Text>
        </View>
      </View>

      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder={`Tìm món (debounce) — ${STUDENT.mssv}`}
          placeholderTextColor={COLORS.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      {renderContent()}

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
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  roomSubtitle: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondary,
    marginTop: 2,
  },
  badgeMssv: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.sm,
  },
  badgeMssvText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  searchSection: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  searchInput: {
    height: 44,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: 14,
    fontSize: 14,
    color: COLORS.text,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: SPACING.xs,
  },
  flashListContent: {
    paddingBottom: SPACING.md,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 14,
    color: COLORS.textLight,
  },
  errorMssv: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.error,
    marginBottom: 6,
  },
  errorTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  retryBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: RADIUS.md,
  },
  retryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
});
