import React, { forwardRef, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, Animated, Image, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView,
  StyleSheet, Text, TextInput, TextInputProps, View, ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { brand, radius } from '../../theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
export const Icon = ({ name, size = 20, color = brand.ink }: { name: IconName; size?: number; color?: string }) =>
  <Ionicons name={name} size={size} color={color} />;

export const Logo = ({ height = 40 }: { height?: number }) =>
  <Image source={require('../../../assets/logo.png')} style={{ height, width: height * (2032 / 566) }} resizeMode="contain" accessibilityLabel="AIGMA PTE Ai" />;

/** Fades and lifts content in on mount. */
export function FadeIn({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: ViewStyle }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(v, { toValue: 1, duration: 320, delay, useNativeDriver: true }).start(); }, [v, delay]);
  return <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }]}>{children}</Animated.View>;
}

/** White auth page with keyboard handling, optional back bar and sticky footer. */
export function AuthScreen({ children, onBack, footer }: { children: React.ReactNode; onBack?: () => void; footer?: React.ReactNode }) {
  return <SafeAreaView style={s.screen} edges={['top', 'bottom', 'left', 'right']}>
    <StatusBar style="dark" />
    {/* Android is edge-to-edge since SDK 54: the window no longer resizes for the keyboard, so pad on both platforms. */}
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
      {onBack && <View style={s.appbar}>
        <Pressable onPress={onBack} style={s.back} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back"><Icon name="arrow-back" size={22} /></Pressable>
      </View>}
      <ScrollView keyboardShouldPersistTaps="handled" keyboardDismissMode="none" contentContainerStyle={[s.page, !onBack && { paddingTop: 16 }]} showsVerticalScrollIndicator={false}>
        {/* No animated/transformed wrapper around inputs: it can make Android drop TextInput focus. */}
        <View style={{ gap: 22 }}>{children}</View>
      </ScrollView>
      {footer && <View style={s.footer}>{footer}</View>}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export const Title = ({ title, sub }: { title: string; sub?: React.ReactNode }) =>
  <View style={{ gap: 8 }}><Text style={s.h1} accessibilityRole="header">{title}</Text>{sub ? <Text style={s.sub}>{sub}</Text> : null}</View>;

export const Bold = ({ children }: { children: React.ReactNode }) => <Text style={{ fontWeight: '700', color: brand.ink2 }}>{children}</Text>;

export function Button({ label, onPress, busy, busyLabel, variant = 'primary', icon, disabled }: {
  label: string; onPress: () => void; busy?: boolean; busyLabel?: string; variant?: 'primary' | 'outline' | 'ghost'; icon?: IconName | React.ReactNode; disabled?: boolean;
}) {
  const primary = variant === 'primary';
  const color = primary ? brand.white : variant === 'outline' ? brand.ink : brand.primary;
  return <Pressable
    onPress={onPress} disabled={busy || disabled} accessibilityRole="button" accessibilityState={{ busy, disabled }}
    style={({ pressed }) => [s.btn, primary && s.btnPrimary, variant === 'outline' && s.btnOutline, variant === 'ghost' && s.btnGhost, (pressed || busy) && { opacity: 0.85 }, disabled && { opacity: 0.5 }]}>
    {busy ? <ActivityIndicator color={color} /> : typeof icon === 'string' ? null : icon}
    <Text style={[s.btnText, { color }]}>{busy ? busyLabel ?? label : label}</Text>
    {!busy && typeof icon === 'string' && <Icon name={icon as IconName} color={color} />}
  </Pressable>;
}

export const LinkText = ({ label, onPress }: { label: string; onPress: () => void }) =>
  <Text style={s.link} onPress={onPress} accessibilityRole="link" suppressHighlighting>{label}</Text>;

export const ErrorText = ({ msg }: { msg?: string }) => msg
  ? <View style={s.errRow}><Icon name="alert-circle" size={16} color={brand.red600} /><Text style={s.errText}>{msg}</Text></View> : null;

export const ErrorBanner = ({ msg }: { msg?: string }) => msg
  ? <FadeIn style={s.banner}><Icon name="alert-circle" color={brand.red} /><Text style={s.bannerText} accessibilityLiveRegion="polite">{msg}</Text></FadeIn> : null;

export const InfoBanner = ({ children }: { children: React.ReactNode }) =>
  <View style={s.info}><Icon name="information-circle" color={brand.primary} /><Text style={s.infoText}>{children}</Text></View>;

type FieldProps = TextInputProps & { label: string; icon: IconName; error?: string; password?: boolean; footer?: React.ReactNode };
export const Field = forwardRef<TextInput, FieldProps>(function Field({ label, icon, error, password, footer, style, ...rest }, ref) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  return <View style={{ gap: 8 }}>
    <Text style={s.label}>{label}</Text>
    <View style={[s.inputWrap, focused && s.inputFocus, !!error && s.inputErr]}>
      <Icon name={icon} color={error ? brand.red : focused ? brand.primary : brand.muted} />
      <TextInput
        ref={ref} autoCorrect={false} {...(password ? { autoCapitalize: 'none' as const, spellCheck: false } : {})} {...rest} secureTextEntry={password && hidden} placeholderTextColor="#98A2B5"
        onFocus={e => { setFocused(true); rest.onFocus?.(e); }} onBlur={e => { setFocused(false); rest.onBlur?.(e); }}
        style={[s.input, style]} accessibilityLabel={label} />
      {password && <Pressable onPress={() => setHidden(h => !h)} hitSlop={10} accessibilityRole="button" accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
        <Icon name={hidden ? 'eye-outline' : 'eye-off-outline'} color={brand.muted} />
      </Pressable>}
    </View>
    {footer}
    <ErrorText msg={error} />
  </View>;
});

export function StrengthMeter({ score, visible }: { score: number; visible: boolean }) {
  const colors = [brand.red, brand.red, '#D98200', brand.primary, brand.green];
  const label = ['Weak', 'Weak', 'Fair', 'Good', 'Strong'][score];
  return <View style={s.meter} accessibilityLabel={visible ? `Password strength ${label}` : undefined}>
    {[0, 1, 2, 3].map(k => <View key={k} style={[s.meterBar, visible && k < score && { backgroundColor: colors[score] }]} />)}
    <Text style={s.meterText}>{visible ? label : ''}</Text>
  </View>;
}

export const Divider = ({ label }: { label: string }) =>
  <View style={s.divRow}><View style={s.divLine} /><Text style={s.divText}>{label}</Text><View style={s.divLine} /></View>;

export function Checkbox({ checked, onChange, children, error }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode; error?: string }) {
  return <View style={{ gap: 8 }}>
    <View style={s.checkRow}>
      <Pressable onPress={() => onChange(!checked)} hitSlop={10} accessibilityRole="checkbox" accessibilityState={{ checked }}
        style={[s.check, checked && s.checkOn, !!error && !checked && { borderColor: brand.red }]}>
        {checked && <Icon name="checkmark" size={16} color={brand.white} />}
      </Pressable>
      <Text style={s.checkText} onPress={() => onChange(!checked)} suppressHighlighting>{children}</Text>
    </View>
    <ErrorText msg={error} />
  </View>;
}

/** Bottom sheet used for demo social sign-in and confirmations. */
export function Sheet({ visible, onClose, children }: { visible: boolean; onClose: () => void; children: React.ReactNode }) {
  return <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <Pressable style={s.scrim} onPress={onClose} accessibilityLabel="Close" />
    <SafeAreaView edges={['bottom']} style={s.sheet}><View style={s.grabber} />{children}</SafeAreaView>
  </Modal>;
}

/** Centered result dialog (e.g. "Password updated"). */
export function Dialog({ visible, icon, title, body, action, onAction }: { visible: boolean; icon: IconName; title: string; body: string; action: string; onAction: () => void }) {
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onAction}>
    <View style={s.dialogScrim}><View style={s.dialog}>
      <View style={[s.tileLg, { backgroundColor: brand.green50 }]}><Icon name={icon} size={30} color={brand.green} /></View>
      <Text style={[s.h3, { textAlign: 'center' }]}>{title}</Text>
      <Text style={[s.sub, { textAlign: 'center', fontSize: 15 }]}>{body}</Text>
      <View style={{ alignSelf: 'stretch', marginTop: 6 }}><Button label={action} onPress={onAction} /></View>
    </View></View>
  </Modal>;
}

export const IconTile = ({ name, color = brand.primary, bg = brand.primary50 }: { name: IconName; color?: string; bg?: string }) =>
  <View style={[s.tileLg, { backgroundColor: bg }]}><Icon name={name} size={28} color={color} /></View>;

export const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: brand.white },
  appbar: { height: 52, paddingHorizontal: 12, justifyContent: 'center' },
  back: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  page: { paddingHorizontal: 24, paddingBottom: 32, paddingTop: 4 },
  footer: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 12, gap: 12, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: brand.line, backgroundColor: brand.white },
  h1: { fontSize: 28, lineHeight: 34, fontWeight: '800', color: brand.ink, letterSpacing: -0.4 },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '800', color: brand.ink },
  sub: { fontSize: 16, lineHeight: 23, color: brand.muted },
  label: { fontSize: 14, fontWeight: '700', color: brand.ink2 },
  inputWrap: { height: 54, borderRadius: radius.md, borderWidth: 1.5, borderColor: brand.line2, backgroundColor: brand.white, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14 },
  // Focus changes colours only — toggling shadow/elevation re-creates the native view on Android and drops focus.
  inputFocus: { borderColor: brand.primary },
  inputErr: { borderColor: brand.red, backgroundColor: '#FFFAFA' },
  input: { flex: 1, height: '100%', fontSize: 16, color: brand.ink },
  btn: { height: 56, borderRadius: radius.md, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingHorizontal: 20 },
  btnPrimary: { backgroundColor: brand.primary, shadowColor: brand.primary700, shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3 },
  btnOutline: { borderWidth: 1.5, borderColor: brand.line2, backgroundColor: brand.white },
  btnGhost: { backgroundColor: 'transparent', height: 48 },
  btnText: { fontSize: 16, fontWeight: '800' },
  link: { fontSize: 14, fontWeight: '700', color: brand.primary },
  errRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  errText: { fontSize: 13, fontWeight: '600', color: brand.red600, flex: 1 },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: brand.red50, borderWidth: 1, borderColor: '#F5C2C2' },
  bannerText: { flex: 1, fontSize: 14, fontWeight: '600', color: brand.red600 },
  info: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.md, backgroundColor: brand.primary50 },
  infoText: { flex: 1, fontSize: 14, color: brand.ink2 },
  meter: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  meterBar: { flex: 1, height: 5, borderRadius: 3, backgroundColor: brand.line },
  meterText: { width: 52, textAlign: 'right', fontSize: 12, fontWeight: '700', color: brand.muted },
  divRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  divLine: { flex: 1, height: 1, backgroundColor: brand.line },
  divText: { fontSize: 13, color: brand.muted },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  check: { width: 26, height: 26, borderRadius: 8, borderWidth: 1.5, borderColor: brand.line2, alignItems: 'center', justifyContent: 'center' },
  checkOn: { backgroundColor: brand.primary, borderColor: brand.primary },
  checkText: { flex: 1, fontSize: 14, color: brand.ink2, lineHeight: 20 },
  scrim: { flex: 1, backgroundColor: 'rgba(16,35,74,0.45)' },
  sheet: { backgroundColor: brand.white, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: 24, paddingBottom: 16, gap: 16 },
  grabber: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: brand.line2, marginTop: 10 },
  dialogScrim: { flex: 1, backgroundColor: 'rgba(16,35,74,0.45)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  dialog: { width: '100%', maxWidth: 360, backgroundColor: brand.white, borderRadius: radius.xl, padding: 24, alignItems: 'center', gap: 12 },
  tileLg: { width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  center: { textAlign: 'center', fontSize: 14, color: brand.ink2 },
});
