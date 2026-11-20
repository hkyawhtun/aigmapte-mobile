import React, { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AuthError, authService, CodePurpose, DEMO_CODE } from '../../../api/auth';
import { useAuth } from '../AuthContext';
import { AuthScreen, Bold, Button, ErrorText, IconTile, InfoBanner, LinkText, Title, s } from '../ui';
import type { AuthNav } from '../nav';
import { brand, radius } from '../../../theme';

const LEN = 6;
const RESEND_SECONDS = 30;

export function Otp({ nav, email, purpose }: { nav: AuthNav; email: string; purpose: CodePurpose }) {
  const { signIn } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [left, setLeft] = useState(RESEND_SECONDS);
  const [notice, setNotice] = useState<string>();
  const input = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (left <= 0) return;
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const runShake = () => Animated.sequence([10, -10, 6, -6, 0].map(toValue =>
    Animated.timing(shake, { toValue, duration: 60, useNativeDriver: true }))).start();

  const verify = async (value = code) => {
    if (value.length < LEN) { setError(`Enter all ${LEN} digits`); runShake(); return; }
    setBusy(true); setError(undefined);
    try {
      const res = await authService.verifyCode(email, value, purpose);
      setBusy(false);
      if (purpose === 'reset' && res.resetToken) nav.replace({ name: 'newPassword', resetToken: res.resetToken });
      else if (res.session) signIn(res.session);
    } catch (err) {
      setBusy(false);
      setError(err instanceof AuthError ? err.message : 'Something went wrong. Please try again.');
      setCode(''); runShake(); input.current?.focus();
    }
  };

  const onChange = (v: string) => {
    const digits = v.replace(/\D/g, '').slice(0, LEN);
    setCode(digits); setError(undefined);
    if (digits.length === LEN) verify(digits);
  };

  const resend = async () => {
    setLeft(RESEND_SECONDS); setCode('');
    await authService.resendCode(email, purpose);
    setNotice('A new code has been sent.');
  };

  const mmss = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;

  return <AuthScreen onBack={nav.back}>
    <IconTile name="mail-outline" />
    <Title title="Verify your email" sub={<>Enter the 6-digit code we sent to <Bold>{email}</Bold></>} />

    <Pressable onPress={() => input.current?.focus()} accessibilityLabel={`Verification code, ${code.length} of ${LEN} digits entered`}>
      <Animated.View style={[o.row, { transform: [{ translateX: shake }] }]}>
        {Array.from({ length: LEN }, (_, k) => {
          const active = k === code.length && !busy;
          return <View key={k} style={[o.box, active && o.boxActive, !!code[k] && o.boxFilled, !!error && o.boxErr]}>
            <Text style={o.digit}>{code[k] ?? ''}</Text>
          </View>;
        })}
      </Animated.View>
      {/* One hidden input drives all six boxes: supports paste and SMS/email autofill. */}
      <TextInput
        ref={input} value={code} onChangeText={onChange} maxLength={LEN} autoFocus
        keyboardType="number-pad" textContentType="oneTimeCode" autoComplete="one-time-code"
        style={o.hidden} caretHidden importantForAutofill="yes" />
    </Pressable>

    {error ? <ErrorText msg={error} /> : <InfoBanner>Demo code: <Bold>{DEMO_CODE}</Bold></InfoBanner>}
    <Button label="Verify" busy={busy} busyLabel="Verifying…" onPress={() => verify()} />
    {notice && left > 0 && <Text style={[s.center, { color: brand.green, fontWeight: '600' }]}>{notice}</Text>}
    <Text style={[s.center, { color: brand.muted }]}>
      {left > 0 ? <>Resend code in <Bold>{mmss}</Bold></> : <>Didn’t get it? <LinkText label="Resend code" onPress={resend} /></>}
    </Text>
  </AuthScreen>;
}

const o = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 8 },
  box: { flex: 1, maxWidth: 54, height: 60, borderRadius: radius.md, borderWidth: 1.5, borderColor: brand.line2, alignItems: 'center', justifyContent: 'center', backgroundColor: brand.white },
  boxActive: { borderColor: brand.primary, borderWidth: 2 },
  boxFilled: { backgroundColor: brand.primary50, borderColor: brand.primary100 },
  boxErr: { borderColor: brand.red, backgroundColor: '#FFFAFA' },
  digit: { fontSize: 24, fontWeight: '800', color: brand.ink },
  hidden: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
