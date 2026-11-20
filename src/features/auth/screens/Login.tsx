import React, { useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { AuthError, authService } from '../../../api/auth';
import { isValidEmail, useAuth } from '../AuthContext';
import { AuthScreen, Button, Divider, ErrorBanner, Field, LinkText, Logo, Title, s } from '../ui';
import { SocialButtons } from './SocialButtons';
import type { AuthNav } from '../nav';
import { brand } from '../../../theme';

export function Login({ nav, initialEmail = '' }: { nav: AuthNav; initialEmail?: string }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const pwRef = useRef<TextInput>(null);
  const edit = (k: 'email' | 'password', set: (v: string) => void) => (v: string) => { set(v); setErrors(e => ({ ...e, [k]: undefined, form: undefined })); };

  const submit = async () => {
    const e: typeof errors = {};
    if (!isValidEmail(email.trim())) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Enter your password';
    setErrors(e);
    if (Object.keys(e).length) return;
    setBusy(true);
    try {
      signIn(await authService.login(email.trim(), password));
    } catch (err) {
      setErrors({ form: err instanceof AuthError ? err.message : 'Something went wrong. Please try again.' });
      setPassword('');
      setBusy(false);
    }
  };

  return <AuthScreen>
    <View style={{ marginTop: 8 }}><Logo height={44} /></View>
    <Title title="Welcome back" sub="Sign in to continue your PTE preparation." />
    <ErrorBanner msg={errors.form} />
    <View style={{ gap: 16 }}>
      <Field label="Email" icon="mail-outline" value={email} onChangeText={edit('email', setEmail)} error={errors.email}
        placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email"
        textContentType="emailAddress" returnKeyType="next" onSubmitEditing={() => pwRef.current?.focus()} />
      <Field ref={pwRef} label="Password" icon="lock-closed-outline" password value={password} onChangeText={edit('password', setPassword)}
        error={errors.password} placeholder="Enter your password" autoComplete="current-password"
        textContentType="password" returnKeyType="go" onSubmitEditing={submit} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <Text style={{ flex: 1, fontSize: 12, color: brand.muted }}>Demo: password <Text style={{ fontWeight: '700' }}>wrong</Text> shows an error</Text>
        <LinkText label="Forgot password?" onPress={() => nav.push({ name: 'forgot', email: email.trim() })} />
      </View>
      <Button label="Sign in" busy={busy} busyLabel="Signing in…" onPress={submit} />
    </View>
    <Divider label="or continue with" />
    <SocialButtons />
    <Text style={s.center}>New to AIGMA? <LinkText label="Create an account" onPress={() => nav.push({ name: 'register' })} /></Text>
  </AuthScreen>;
}
