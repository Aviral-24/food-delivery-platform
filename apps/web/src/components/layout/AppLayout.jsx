import { Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Navbar } from './Navbar';

export function AppLayout() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface text-ink">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-brand focus:px-4 focus:py-2 focus:text-white"
      >
        {t('app.skipToContent')}
      </a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}