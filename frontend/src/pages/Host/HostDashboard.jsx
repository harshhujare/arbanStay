import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import propertyService from "../../api/propertyService";
import { useCachedFetch } from "../../hooks/useCachedFetch";
import { cache, CACHE_TTL } from "../../utils/cache";
import PropertyCard from "../../components/Property/PropertyCard";
import EditPropertyModal from "../../components/Property/EditPropertyModal";
import {
  Plus,
  Home,
  Crown,
  AlertTriangle,
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [editProperty, setEditProperty] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Account limits
  const accountType = user?.accountType || "free";
  const listingLimit = accountType === "premium" ? 20 : 2;
  const listingsUsed = user?.propertiesListedThisMonth || 0;
  const canAddMore = listingsUsed < listingLimit;

  // ── Cached fetch for host properties ──────────────────────────────────────
  const {
    data: propertiesData,
    loading,
    error: fetchError,
    refresh,
  } = useCachedFetch(
    "my_properties",
    () => propertyService.getMyProperties(),
    { ttl: CACHE_TTL.MY_PROPERTIES, enabled: !!user }
  );

  const properties = propertiesData?.data || [];
  const error      = fetchError ? "Failed to load properties. Please try again." : "";

  // Rebuild chart whenever properties change
  useEffect(() => {
    if (properties.length > 0) buildChartData(properties);
  }, [properties]);

  // Build a 30-day chart from aggregated viewHistory across all properties
  const buildChartData = (props) => {
    const dayMap = {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Initialize last 30 days
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      dayMap[key] = { date: key, views: 0 };
    }

    // Aggregate viewHistory from all properties
    props.forEach((prop) => {
      (prop.viewHistory || []).forEach((entry) => {
        const key = new Date(entry.date).toISOString().split("T")[0];
        if (dayMap[key]) {
          dayMap[key].views += entry.count || 0;
        }
      });
    });

    const data = Object.values(dayMap).map((d) => ({
      date: new Date(d.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
      views: d.views,
    }));

    setChartData(data);
  };

  const handlePropertyDeleted = (propertyId) => {
    // Invalidate both my-properties cache and the public listing cache
    cache.invalidate("my_properties");
    cache.invalidateByPrefix("properties_");
    refresh(); // re-fetch from API
  };

  // Summary stats
  const totalViews = properties.reduce((sum, p) => sum + (p.views || 0), 0);
  const totalLikes = properties.reduce((sum, p) => sum + (p.likes || 0), 0);
  const totalContacts = properties.reduce(
    (sum, p) => sum + (p.contactRequests || 0),
    0,
  );

  const statCards = [
    {
      label: "Total Properties",
      value: properties.length,
      icon: Home,
      color: "bg-blue-50 text-blue-600",
      border: "border-blue-200",
    },
    {
      label: "Total Views",
      value: totalViews,
      icon: Eye,
      color: "bg-purple-50 text-purple-600",
      border: "border-purple-200",
    },
    {
      label: "Total Likes",
      value: totalLikes,
      icon: Heart,
      color: "bg-pink-50 text-pink-600",
      border: "border-pink-200",
    },
    {
      label: "Contact Requests",
      value: totalContacts,
      icon: MessageSquare,
      color: "bg-green-50 text-green-600",
      border: "border-green-200",
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-semibold" style={{ color: "var(--text-primary)" }}>
                Host Dashboard
              </h1>
              {/* Account Type Badge */}
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    accountType === "premium"
                      ? "bg-amber-100 text-amber-800"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {accountType === "premium" && <Crown className="w-3 h-3" />}
                  {accountType === "premium" ? "Premium" : "Free"} Account
                </span>
                <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
                  {listingsUsed}/{listingLimit} listings this month
                </span>
              </div>
            </div>
            <button
              onClick={() => navigate("/host/dashboard/add-property")}
              disabled={!canAddMore}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 font-medium ${
                canAddMore
                  ? "bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white hover:shadow-lg"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Plus className="w-5 h-5" />
              Add Property
            </button>
          </div>
        </div>
      </div>

      {/* Listing Limit Warning */}
      {!canAddMore && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-amber-800">
                Monthly listing limit reached
              </p>
              <p className="text-sm text-amber-700 mt-1">
                You've used all {listingLimit} listings for this month (
                {accountType} account).
                {accountType === "free" &&
                  " Upgrade to Premium to list up to 20 properties per month."}
              </p>
            </div>
          </div>
        </div>
      )}

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
            canAddMore={canAddMore}
          />
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl border p-5 flex items-center gap-4 transition hover:shadow-md ${stat.border}`}
                  style={{ background: "var(--bg-card)" }}
                >
                  <div
                    className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}
                  >
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold" style={{ color: "var(--text-primary)" }}>
                      {stat.value}
                    </p>
                    <p className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
                      {stat.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Views Chart */}
            <div className="rounded-xl p-6 mb-8" style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-[#FF5A5F]" />
                <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
                  Views — Last 30 Days
                </h2>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="viewsGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#FF5A5F"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#FF5A5F"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickLine={false}
                      axisLine={{ stroke: "var(--border-color)" }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        fontSize: "13px",
                        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#FF5A5F"
                      strokeWidth={2.5}
                      fill="url(#viewsGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Properties Grid */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
                Your Properties ({properties.length})
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property._id}
                  property={property}
                  onUpdate={() => {
                    cache.invalidate("my_properties");
                    cache.invalidateByPrefix("properties_");
                    refresh();
                  }}
                  onDelete={handlePropertyDeleted}
                  onEdit={(p) => setEditProperty(p)}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Edit Property Modal */}
      {editProperty && (
        <EditPropertyModal
          property={editProperty}
          onClose={() => setEditProperty(null)}
          onUpdate={() => {
            cache.invalidate("my_properties");
            cache.invalidateByPrefix("properties_");
            refresh();
          }}
        />
      )}
    </div>
  );
}

// Empty State Component
function EmptyState({ onAddClick, canAddMore }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--bg-secondary)" }}>
        <Home className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-2xl font-semibold mb-2" style={{ color: "var(--text-primary)" }}>
        No properties yet
      </h3>
      <p className="text-center max-w-md mb-8" style={{ color: "var(--text-secondary)" }}>
        Start earning by listing your first property. It only takes a few
        minutes to create a listing.
      </p>
      <button
        onClick={onAddClick}
        disabled={!canAddMore}
        className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-all duration-200 font-medium text-lg ${
          canAddMore
            ? "bg-gradient-to-r from-[#FF5A5F] to-[#E0484D] text-white hover:shadow-lg"
            : "bg-gray-200 text-gray-500 cursor-not-allowed"
        }`}
      >
        <Plus className="w-6 h-6" />
        Create Your First Listing
      </button>
    </div>
  );
}
