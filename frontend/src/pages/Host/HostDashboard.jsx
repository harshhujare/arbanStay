import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import propertyService from "../../api/propertyService";
import PropertyCard from "../../components/Property/PropertyCard";
import { Plus, Home } from "lucide-react";

export default function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProperties();
  }, []);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const data = await propertyService.getMyProperties();
      setProperties(data.data);
      setError("");
    } catch (error) {
      console.error("Failed to load properties:", error);
      setError("Failed to load properties. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handlePropertyDeleted = (propertyId) => {
    setProperties(properties.filter((p) => p._id !== propertyId));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">
                Welcome back, {user?.name}
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your properties and track your performance
              </p>
            </div>
            <button
              onClick={() => navigate("/host/dashboard/add-property")}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium"
            >
              <Plus className="w-5 h-5" />
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-[#FF5A5F]"></div>
          </div>
        ) : properties.length === 0 ? (
          <EmptyState
            onAddClick={() => navigate("/host/dashboard/add-property")}
          />
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Properties ({properties.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onUpdate={loadProperties}
                  onDelete={handlePropertyDeleted}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Empty State Component
function EmptyState({ onAddClick }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Home className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-semibold text-gray-900 mb-2">
        No properties yet
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        Start earning by listing your first property. It only takes a few
        minutes to create a listing.
      </p>
      <button
        onClick={onAddClick}
        className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-lg"
      >
        <Plus className="w-6 h-6" />
        Create Your First Listing
      </button>
    </div>
  );
}
