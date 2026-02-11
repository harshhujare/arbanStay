import { AuthProvider } from "./context/AuthContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Home/Navbar/Navbar";
import HomePage from "./pages/Home/HomePage";
import HostDashboard from "./pages/Host/HostDashboard";
import AddPropertyPage from "./pages/Host/AddPropertyPage";
import PropertyDetailPage from "./pages/Properties/PropertyDetailPage";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div>
          <Navbar />
          <Routes>
            {/* Home Page - Shows all properties (minimalist, no Hero banner) */}
            <Route path="/" element={<HomePage />} />

            {/* Property Detail Page */}
            <Route path="/property/:id" element={<PropertyDetailPage />} />

            {/* Host Dashboard */}
            <Route path="/host/dashboard" element={<HostDashboard />} />

            {/* Add Property - Multi-step form */}
            <Route
              path="/host/dashboard/add-property"
              element={<AddPropertyPage />}
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
