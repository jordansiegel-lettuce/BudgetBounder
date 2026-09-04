import { router, Tabs } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

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
        name="tower-launcher"
        options={{
          title: 'Tower',
          tabBarButton: ({ accessibilityState }) => (
            <Pressable
              accessibilityLabel="Open Tower game"
              accessibilityRole="button"
              onPress={() => router.push('/tower')}
              style={styles.towerTab}>
              <View style={[styles.towerOrb, accessibilityState?.selected && styles.towerOrbActive]}>
                <IconSymbol size={27} name="gamecontroller.fill" color={bb.colors.carbon} />
              </View>
              <Text style={styles.towerLabel}>TOWER</Text>
            </Pressable>
          ),
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

const styles = StyleSheet.create({
  towerTab: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: -16 },
  towerOrb: { width: 54, height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', backgroundColor: bb.colors.gold, borderWidth: 3, borderTopColor: '#FFE5A2', borderLeftColor: '#FFE5A2', borderRightColor: '#9C5A11', borderBottomColor: '#9C5A11', elevation: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 8, shadowOffset: { width: 0, height: 5 } },
  towerOrbActive: { backgroundColor: bb.colors.navGold },
  towerLabel: { color: bb.colors.navGold, fontFamily: bb.fonts.body, fontSize: 9, fontWeight: '900', letterSpacing: 0.6, marginTop: 1 },
});
