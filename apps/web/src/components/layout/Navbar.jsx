import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Moon, Sun, Languages, LogOut, UtensilsCrossed, ShoppingBag } from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useThemeStore();
  const { user, token, logout } = useAuthStore();
  const { items, restaurantId } = useCartStore();
  const navigate = useNavigate();

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface-card/90 backdrop-blur">
      <nav
        aria-label="Primary navigation"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3"
      >
        <Link to="/" className="flex items-center gap-2 text-lg font-bold text-brand">
          <UtensilsCrossed className="h-5 w-5" aria-hidden="true" />
          <span>{t('app.brand')}</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Link to="/" className="text-sm font-medium text-ink-muted hover:text-ink">
            {t('nav.home')}
          </Link>

          <Link to="/system" className="text-sm font-medium text-ink-muted hover:text-ink">
            System
          </Link>

          {token && (
            <>
              <Link to="/orders" className="text-sm font-medium text-ink-muted hover:text-ink">
                Orders
              </Link>
              <Link to="/owner" className="text-sm font-medium text-ink-muted hover:text-ink">
                Owner Studio
              </Link>
              <Link to="/dashboard" className="text-sm font-medium text-ink-muted hover:text-ink">
                {t('nav.dashboard')}
              </Link>
            </>
          )}

          {cartCount > 0 && restaurantId && (
            <Link
              to={`/restaurants/${restaurantId}`}
              className="inline-flex items-center gap-1 rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand"
            >
              <ShoppingBag className="h-3.5 w-3.5" />
              {cartCount}
            </Link>
          )}

          <Button
            variant="ghost"
            onClick={toggleLanguage}
            aria-label={t('nav.switchLang')}
            className="px-2.5"
          >
            <Languages className="h-4 w-4" aria-hidden="true" />
            <span>{i18n.language === 'en' ? 'हिं' : 'EN'}</span>
          </Button>

          <Button
            variant="ghost"
            onClick={toggleTheme}
            aria-label={t('nav.toggleTheme')}
            aria-pressed={theme === 'dark'}
            className="px-2.5"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </Button>

          {token ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs text-ink-muted md:inline">{user?.name}</span>
              <Button variant="secondary" onClick={handleLogout} className="px-3 py-1.5">
                <LogOut className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">{t('nav.logout')}</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" className="px-3 py-1.5">
                  {t('nav.login')}
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" className="px-3 py-1.5">
                  {t('nav.register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}