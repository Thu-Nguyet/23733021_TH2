import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import { ShopStack } from '@navigation/ShopStack';
import { CartScreen } from '@screens/CartScreen';
import { MeScreen } from '@screens/MeScreen';
import { COLORS } from '@constants/theme';
import { VARIANT } from '@constants/student';
import { useCartStore } from '@stores/cartStore';

export type MainTabParamList = {
  Shop: undefined;
  Cart: undefined;
  Me: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabs() {
  const items = useCartStore((state) => state.items);
  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const shopTab = (
    <Tab.Screen
      key="Shop"
      name="Shop"
      component={ShopStack}
      options={{
        headerShown: false,
        title: 'Cửa hàng',
        tabBarLabel: 'Cửa hàng',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🏪</Text>,
      }}
    />
  );

  const cartTab = (
    <Tab.Screen
      key="Cart"
      name="Cart"
      component={CartScreen}
      options={{
        title: 'Giỏ hàng',
        tabBarLabel: 'Giỏ hàng',
        tabBarBadge: totalCount > 0 ? totalCount : undefined,
        tabBarBadgeStyle: { backgroundColor: COLORS.secondary, color: '#fff' },
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>🛒</Text>,
      }}
    />
  );

  const meTab = (
    <Tab.Screen
      key="Me"
      name="Me"
      component={MeScreen}
      options={{
        title: 'Tôi',
        tabBarLabel: 'Tôi',
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 18 }}>👤</Text>,
      }}
    />
  );

  return (
    <Tab.Navigator
      id="MainTabs"
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.surface },
        headerTintColor: COLORS.text,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textLight,
      }}
    >
      {VARIANT.tabOrder === 'cartFirst'
        ? [cartTab, shopTab, meTab]
        : [shopTab, cartTab, meTab]}
    </Tab.Navigator>
  );
}