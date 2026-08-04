import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { bb } from '@/src/theme/tokens';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: bb.colors.navGold,
        tabBarInactiveTintColor: bb.colors.muted,
        tabBarStyle: {
          backgroundColor: bb.colors.carbon,
          borderTopColor: bb.colors.bevelLight,
          borderTopWidth: 1,
          borderTopLeftRadius: bb.radius.xl,
          borderTopRightRadius: bb.radius.xl,
          height: 72,
          paddingBottom: 9,
          paddingTop: 7,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: bb.fonts.body,
          fontWeight: '900',
          letterSpacing: 0.4,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="transactions"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="creditcard.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="target" color={color} />,
        }}
      />
      <Tabs.Screen
        name="missions"
        options={{
          title: 'Missions',
          tabBarIcon: ({ color }) => <IconSymbol size={25} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={25} name="person.crop.circle.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
