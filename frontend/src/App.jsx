import { AuthProvider } from "./context/AuthContext";
import { SearchProvider } from "./context/SearchContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";

import Navbar from "./components/Home/Navbar/Navbar";
import HomePage from "./pages/Home/HomePage";
import HostDashboard from "./pages/Host/HostDashboard";
import AddPropertyPage from "./pages/Host/AddPropertyPage";
import PropertyDetailPage from "./pages/Properties/PropertyDetailPage";
import AccountPage from "./pages/Account/AccountPage";
import PricingPage from "./pages/Pricing/PricingPage";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import AdminRoute from "./components/Auth/AdminRoute";
import BottomNav from "./components/Navigation/BottomNav";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsersPage from "./pages/Admin/AdminUsersPage";
import AdminPropertiesPage from "./pages/Admin/AdminPropertiesPage";
import AdminBookingsPage from "./pages/Admin/AdminBookingsPage";
import AdminTransactionsPage from "./pages/Admin/AdminTransactionsPage";
import AdminReviewsPage from "./pages/Admin/AdminReviewsPage";

const AppInner = () => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div className={isAdminPath ? "" : "pb-16 md:pb-0"}>
      {!isAdminPath && <Navbar />}
      <Routes>
        {/* Home Page */}
        <Route path="/" element={<HomePage />} />

        {/* Property Detail Page */}
        <Route path="/property/:id" element={<PropertyDetailPage />} />

        {/* Host Dashboard - Protected */}
        <Route
          path="/host/dashboard"
          element={
            <ProtectedRoute>
              <HostDashboard />
            </ProtectedRoute>
          }
        />

        {/* Add Property - Multi-step form - Protected */}
        <Route
          path="/host/dashboard/add-property"
          element={
            <ProtectedRoute>
              <AddPropertyPage />
            </ProtectedRoute>
          }
        />

        {/* Account Settings Page - Protected */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />

        {/* Pricing / Upgrade Page - Protected */}
        <Route
          path="/pricing"
          element={
            <ProtectedRoute>
              <PricingPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
        <Route path="/admin/properties" element={<AdminRoute><AdminPropertiesPage /></AdminRoute>} />
        <Route path="/admin/bookings" element={<AdminRoute><AdminBookingsPage /></AdminRoute>} />
        <Route path="/admin/transactions" element={<AdminRoute><AdminTransactionsPage /></AdminRoute>} />
        <Route path="/admin/reviews" element={<AdminRoute><AdminReviewsPage /></AdminRoute>} />
      </Routes>

      {/* Mobile Bottom Navigation - hide on admin pages */}
      {!isAdminPath && <BottomNav />}
    </div>
  );
};

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <ThemeProvider>
        <AuthProvider>
          <SearchProvider>
            <Router>
              <AppInner />
            </Router>
          </SearchProvider>
        </AuthProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
};

export default App;
