import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { ROLES } from '@food-delivery/shared';
import { registerFormSchema } from '@/schemas/auth.schema';
import { useRegisterMutation } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function RegisterPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerFormSchema),
    defaultValues: { role: ROLES.CUSTOMER },
  });

  const onSubmit = (values) => {
    registerMutation.mutate(values, {
      onSuccess: () => navigate('/dashboard', { replace: true }),
    });
  };

  return (
    <div className="mx-auto max-w-md pt-6">
      <Card>
        <h1 className="mb-5 text-2xl font-bold">{t('auth.registerTitle')}</h1>

        {registerMutation.isError && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300"
          >
            {registerMutation.error?.message}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <Input
            label={t('auth.name')}
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />
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
            autoComplete="new-password"
            error={errors.password?.message}
            {...register('password')}
          />
          <div className="flex flex-col gap-1.5">
            <label htmlFor="role-select" className="text-sm font-medium text-ink">
              {t('auth.role')}
            </label>
            <select
              id="role-select"
              className="rounded-lg border border-border bg-surface-card px-3 py-2 text-sm text-ink"
              {...register('role')}
            >
              <option value={ROLES.CUSTOMER}>Customer</option>
              <option value={ROLES.RESTAURANT_OWNER}>Restaurant Owner</option>
              <option value={ROLES.RIDER}>Delivery Rider</option>
            </select>
          </div>

          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? t('auth.submitting') : t('auth.submitRegister')}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-ink-muted">
          {t('auth.haveAccount')}{' '}
          <Link to="/login" className="font-medium text-brand hover:underline">
            {t('nav.login')}
          </Link>
        </p>
      </Card>
    </div>
  );
}