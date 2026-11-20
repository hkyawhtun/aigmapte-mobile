import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BackHandler } from 'react-native';
import { useAuth } from './AuthContext';
import type { AuthNav, AuthRoute } from './nav';
import { Onboarding } from './screens/Onboarding';
import { Login } from './screens/Login';
import { Register } from './screens/Register';
import { ForgotPassword, NewPassword } from './screens/Password';
import { Otp } from './screens/Otp';

/**
 * Small stack navigator for the signed-out flow. Kept dependency-free for the
 * UI phase; swap for Expo Router `(auth)` routes when navigation is adopted app-wide.
 */
export function AuthFlow() {
  const { onboarded } = useAuth();
  const [stack, setStack] = useState<AuthRoute[]>([{ name: onboarded ? 'login' : 'onboarding' }]);

  const back = useCallback(() => setStack(s => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const nav = useMemo<AuthNav>(() => ({
    push: r => setStack(s => [...s, r]),
    replace: r => setStack(s => [...s.slice(0, -1), r]),
    reset: r => setStack([r]),
    back,
    canGoBack: stack.length > 1,
  }), [back, stack.length]);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (stack.length > 1) { back(); return true; }
      return false;
    });
    return () => sub.remove();
  }, [stack.length, back]);

  const r = stack[stack.length - 1]!;
  const key = `${stack.length}-${r.name}`;
  switch (r.name) {
    case 'onboarding': return <Onboarding key={key} nav={nav} />;
    case 'login': return <Login key={key} nav={nav} initialEmail={r.email} />;
    case 'register': return <Register key={key} nav={nav} />;
    case 'forgot': return <ForgotPassword key={key} nav={nav} initialEmail={r.email} />;
    case 'otp': return <Otp key={key} nav={nav} email={r.email} purpose={r.purpose} />;
    case 'newPassword': return <NewPassword key={key} nav={nav} resetToken={r.resetToken} />;
  }
}
