import React, { useEffect, useRef } from 'react';
import { ActivityIndicator, Animated, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Logo } from '../ui';
import { brand } from '../../../theme';

export function Splash() {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 6 }).start(); }, [pop]);
  return <View style={{ flex: 1, backgroundColor: brand.white, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
    <StatusBar style="dark" />
    <Animated.View style={{ alignItems: 'center', gap: 22, opacity: pop, transform: [{ scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }}>
      <Logo height={70} />
      <Text style={{ fontSize: 15, fontWeight: '600', color: brand.muted, textAlign: 'center' }}>Your Personal AI-Powered PTE Coach</Text>
    </Animated.View>
    <View style={{ position: 'absolute', bottom: 60, alignItems: 'center', gap: 14 }}>
      <ActivityIndicator color={brand.primary} size="large" />
      <Text style={{ fontSize: 12, color: brand.muted }}>Practise Smarter. Score Higher.</Text>
    </View>
  </View>;
}
