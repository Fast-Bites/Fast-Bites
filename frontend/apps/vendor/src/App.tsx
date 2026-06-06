import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import VendorLayout from '@/components/VendorLayout';
import VendorProtectedRoute from '@/components/VendorProtectedRoute';
import Landing from '@/pages/Landing';
import SignIn from '@/pages/SignIn';
import Dashboard, { HoursPage, MenuPage, OrdersPage } from '@/pages/VendorPages';

export default function App() {
  return (
    <BrowserRouter basename="/vendor">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/sign-in" element={<SignIn />} />

        <Route
          element={
            <VendorProtectedRoute>
              <VendorLayout />
            </VendorProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/hours" element={<HoursPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
