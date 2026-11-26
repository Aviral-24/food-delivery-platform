import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { loginFormSchema } from '@/schemas/auth.schema';
import {
  useLoginMutation,
  useSendPhoneOtpMutation,
  useVerifyPhoneOtpMutation,
} from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function LoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState('email'); // 'email' | 'phone'

  const loginMutation = useLoginMutation();
  const sendOtp = useSendPhoneOtpMutation();
  const verifyOtp = useVerifyPhoneOtpMutation();

  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [devOtpHint, setDevOtpHint] = useState('');

  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginFormSchema),
  });

  const onEmailSubmit = (values) => {
    loginMutation.mutate(values, {
      onSuccess: () => navigate(from, { replace: true }),
    });
  };

  const formatPhone = (value) => {
    const cleaned = value.trim().replace(/[\s-]+/g, '');
    return cleaned.startsWith('+') ? cleaned : `+91${cleaned}`;
  };

  const handleSendOtp = (e) => {
    e.preventDefault();
    setDevOtpHint('');
    setOtp('');
    sendOtp.mutate(
      { phone: formatPhone(phone) },
      {
        onSuccess: (res) => {
          setOtpSent(true);
          if (res?.devOtp) setDevOtpHint(res.devOtp);
        },
      }
    );
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    verifyOtp.mutate(
      { phone: formatPhone(phone), token: otp.trim() },
      { onSuccess: () => navigate(from, { replace: true }) }
    );
  };

  return (
    <div className="mx-auto max-w-md pt-6">
      <Card>
        <h1 className="mb-4 text-2xl font-bold">{t('auth.loginTitle')}</h1>

        {/* Mode Switcher: Email vs Phone OTP */}
        <div className="mb-5 grid grid-cols-2 gap-2 rounded-lg bg-surface p-1">
          <button
            type="button"
            onClick={() => setMode('email')}
            className={`rounded-md py-1.5 text-sm font-medium cursor-pointer ${
              mode === 'email' ? 'bg-surface-card text-brand shadow-xs' : 'text-ink-muted'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => setMode('phone')}
            className={`rounded-md py-1.5 text-sm font-medium cursor-pointer ${
              mode === 'phone' ? 'bg-surface-card text-brand shadow-xs' : 'text-ink-muted'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {mode === 'email' ? (
          <>
            {loginMutation.isError && (
              <div
                role="alert"
                className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              >
                {loginMutation.error?.message}
              </div>
            )}

            <form onSubmit={handleSubmit(onEmailSubmit)} className="space-y-4" noValidate>
              <Input
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />
              <Input
                label={t('auth.password')}
                type="password"
                autoComplete="current-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? t('auth.submitting') : t('auth.submitLogin')}
              </Button>
            </form>
          </>
        ) : (
          <div className="space-y-4">
            {(sendOtp.isError || verifyOtp.isError) && (
              <div
                role="alert"
                className="rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
              >
                {sendOtp.error?.message || verifyOtp.error?.message}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-3">
              <Input
                label="Phone Number (10-digit or +91)"
                placeholder="e.g. 9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
                disabled={sendOtp.isPending || !phone.trim()}
              >
                {sendOtp.isPending ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>

            {otpSent && (
              <form onSubmit={handleVerifyOtp} className="space-y-3 border-t border-border pt-3">
                <p className="text-xs text-emerald-600 dark:text-emerald-400">
                  {devOtpHint ? (
                    <>
                      Dev OTP generated:{' '}
                      <strong className="font-mono text-sm">{devOtpHint}</strong>
                    </>
                  ) : (
                    'OTP sent! Enter the 6-digit code.'
                  )}
                </p>
                <Input
                  label="6-Digit OTP"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={verifyOtp.isPending || otp.trim().length !== 6}
                >
                  {verifyOtp.isPending ? 'Verifying...' : 'Verify OTP & Login'}
                </Button>
              </form>
            )}
          </div>
        )}

        <p className="mt-4 text-center text-sm text-ink-muted">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-medium text-brand hover:underline">
            {t('nav.register')}
          </Link>
        </p>
      </Card>
    </div>
  );
}