import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import MobileOnly from '@/components/MobileOnly';
import VendorLayout from '@/components/VendorLayout';
import VendorProtectedRoute, { VendorVerifiedRoute } from '@/components/VendorProtectedRoute';
import VendorRegistrationGate from '@/components/VendorRegistrationGate';
import VerifyBusiness from '@/pages/VerifyBusiness';
import VerifyBusinessProcessing from '@/pages/VerifyBusinessProcessing';
import VerifyBusinessDocumentation from '@/pages/VerifyBusinessDocumentation';
import VerifyBusinessMenuProcessing from '@/pages/VerifyBusinessMenuProcessing';
import VerifyBusinessDocumentationProcessing from '@/pages/VerifyBusinessDocumentationProcessing';
import MenuSetup from '@/pages/MenuSetup';
import VendorEntryRedirect from '@/pages/VendorEntryRedirect';
import CustomerSignInRedirect from '@/pages/CustomerSignInRedirect';
import Dashboard, { HoursPage, MenuPage, OrdersPage } from '@/pages/VendorPages';

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <MobileOnly>
        <Routes>
          <Route path="/" element={<VendorEntryRedirect />} />
          <Route path="/sign-in" element={<CustomerSignInRedirect />} />

          <Route
            path="/verify-business"
            element={
              <VendorProtectedRoute>
                <VendorRegistrationGate>
                  <VerifyBusiness />
                </VendorRegistrationGate>
              </VendorProtectedRoute>
            }
          />
          <Route
            path="/verify-business/processing"
            element={
              <VendorProtectedRoute>
                <VerifyBusinessProcessing />
              </VendorProtectedRoute>
            }
          />
          <Route
            path="/verify-business/documentation"
            element={
              <VendorProtectedRoute>
                <VerifyBusinessDocumentation />
              </VendorProtectedRoute>
            }
          />
          <Route
            path="/verify-business/catalog-processing"
            element={
              <VendorProtectedRoute>
                <VerifyBusinessMenuProcessing />
              </VendorProtectedRoute>
            }
          />
          <Route
            path="/verify-business/documentation-processing"
            element={
              <VendorProtectedRoute>
                <VerifyBusinessDocumentationProcessing />
              </VendorProtectedRoute>
            }
          />
          <Route
            path="/verify-business/catalog"
            element={
              <VendorProtectedRoute>
                <MenuSetup />
              </VendorProtectedRoute>
            }
          />
          {/* Legacy menu setup URLs */}
          <Route
            path="/verify-business/menu-processing"
            element={<Navigate to="/verify-business/catalog-processing" replace />}
          />
          <Route
            path="/verify-business/menu"
            element={<Navigate to="/verify-business/catalog" replace />}
          />

          <Route
            element={
              <VendorVerifiedRoute>
                <VendorLayout />
              </VendorVerifiedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/hours" element={<HoursPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MobileOnly>
    </BrowserRouter>
  );
}
