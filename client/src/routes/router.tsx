import { Routes, Route } from 'react-router-dom';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { CustomersPage } from '@/pages/CustomersPage';
import { CustomerDetailPage } from '@/pages/CustomerDetailPage';
import { MatchSuggestionsPage } from '@/pages/MatchSuggestionsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PrivateRoute } from './PrivateRoute';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Matchmaker Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <PrivateRoute>
            <CustomersPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/customers/:id"
        element={
          <PrivateRoute>
            <CustomerDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/customers/:id/matches"
        element={
          <PrivateRoute>
            <MatchSuggestionsPage />
          </PrivateRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
