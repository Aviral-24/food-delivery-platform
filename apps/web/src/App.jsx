import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { RestaurantMenuPage } from '@/pages/RestaurantMenuPage';
import { OrdersPage } from '@/pages/OrdersPage';
import { OwnerPortalPage } from '@/pages/OwnerPortalPage';
import { SystemStatusPage } from '@/pages/SystemStatusPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/restaurants/:id" element={<RestaurantMenuPage />} />
        <Route path="/system" element={<SystemStatusPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes (Supabase JWT required) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/owner" element={<OwnerPortalPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}