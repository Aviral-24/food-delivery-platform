import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { useMeQuery } from '@/hooks/useAuth';
import { Card } from '@/components/ui/Card';

export function DashboardPage() {
  const { t } = useTranslation();
  const { data: profile, isLoading, isError, error } = useMeQuery();

  if (isLoading) {
    return (
      <p role="status" aria-live="polite" className="text-sm text-ink-muted">
        {t('auth.submitting')}
      </p>
    );
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-red-600">
        {error?.message}
      </p>
    );
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">{t('dashboard.title')}</h1>
      <Card className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5" aria-hidden="true" />
          <span>{t('dashboard.verifiedNotice')}</span>
        </div>

        <dl className="divide-y divide-border text-sm">
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-muted">{t('auth.name')}</dt>
            <dd className="font-medium">{profile?.name}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-muted">{t('dashboard.emailLabel')}</dt>
            <dd className="font-medium">{profile?.email}</dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-muted">{t('dashboard.roleLabel')}</dt>
            <dd className="rounded bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand">
              {profile?.role}
            </dd>
          </div>
          <div className="flex justify-between py-2.5">
            <dt className="text-ink-muted">{t('dashboard.userIdLabel')}</dt>
            <dd className="font-mono text-xs">{profile?.id}</dd>
          </div>
        </dl>
      </Card>
    </section>
  );
}