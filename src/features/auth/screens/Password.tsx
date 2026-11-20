import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import { authService } from '../../../api/auth';
import { isValidEmail, passwordScore } from '../AuthContext';
import { AuthScreen, Button, Dialog, Field, IconTile, StrengthMeter, Title } from '../ui';
import type { AuthNav } from '../nav';

export function ForgotPassword({ nav, initialEmail = '' }: { nav: AuthNav; initialEmail?: string }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    const v = email.trim();
    if (!isValidEmail(v)) { setError('Enter a valid email address'); return; }
    setError(undefined); setBusy(true);
    await authService.requestReset(v);
    setBusy(false);
    nav.push({ name: 'otp', email: v, purpose: 'reset' });
  };

  return <AuthScreen onBack={nav.back}>
    <IconTile name="lock-closed-outline" />
    <Title title="Forgot password?" sub="Enter the email you registered with. We’ll send you a 6-digit verification code." />
    <Field label="Email" icon="mail-outline" value={email} onChangeText={v => { setEmail(v); setError(undefined); }} error={error}
      placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email"
      textContentType="emailAddress" returnKeyType="send" onSubmitEditing={submit} />
    <Button label="Send code" busy={busy} busyLabel="Sending…" onPress={submit} />
  </AuthScreen>;
}

export function NewPassword({ nav, resetToken }: { nav: AuthNav; resetToken: string }) {
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ pw?: string; confirm?: string }>({});
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const confirmRef = useRef<TextInput>(null);

  const submit = async () => {
    const e: typeof errors = {};
    if (pw.length < 8) e.pw = 'Use at least 8 characters';
    else if (pw !== confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    await authService.resetPassword(resetToken, pw);
    setBusy(false); setDone(true);
  };

  return <AuthScreen onBack={nav.back}>
    <Title title="Create a new password" sub="Your new password must be different from the previous one." />
    <View style={{ gap: 16 }}>
      <Field label="New password" icon="lock-closed-outline" password value={pw} onChangeText={v => { setPw(v); setErrors({}); }} error={errors.pw}
        placeholder="At least 8 characters" autoComplete="new-password" textContentType="newPassword"
        returnKeyType="next" onSubmitEditing={() => confirmRef.current?.focus()}
        footer={<StrengthMeter score={passwordScore(pw)} visible={!!pw} />} />
      <Field ref={confirmRef} label="Confirm password" icon="lock-closed-outline" password value={confirm} onChangeText={v => { setConfirm(v); setErrors(e => ({ ...e, confirm: undefined })); }}
        error={errors.confirm} placeholder="Re-enter your password" autoComplete="new-password" textContentType="newPassword"
        returnKeyType="done" onSubmitEditing={submit} />
    </View>
    <Button label="Reset password" busy={busy} busyLabel="Saving…" onPress={submit} />
    <Dialog visible={done} icon="checkmark-circle" title="Password updated" body="You can now sign in with your new password."
      action="Back to sign in" onAction={() => { setDone(false); nav.reset({ name: 'login' }); }} />
  </AuthScreen>;
}
