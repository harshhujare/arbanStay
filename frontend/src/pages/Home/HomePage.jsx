import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import propertyService from "../../api/propertyService";
import PropertyGrid from "../../components/Property/PropertyGrid";
import FilterSidebar from "../../components/Property/FilterSidebar";
import { SlidersHorizontal } from "lucide-react";

export default function HomePage() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Get filters from URL params
  const [filters, setFilters] = useState({
    q: searchParams.get("q") || "",
    city: searchParams.get("city") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    bedrooms: searchParams.get("bedrooms") || "",
    guests: searchParams.get("guests") || "",
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
  });

  useEffect(() => {
    // Update filters when URL params change
    setFilters({
      q: searchParams.get("q") || "",
      city: searchParams.get("city") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      bedrooms: searchParams.get("bedrooms") || "",
      guests: searchParams.get("guests") || "",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      amenities:
        searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    });
  }, [searchParams]);

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const queryFilters = {};

      if (filters.q) queryFilters.q = filters.q;
      if (filters.city) queryFilters.city = filters.city;
      if (filters.minPrice) queryFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) queryFilters.maxPrice = filters.maxPrice;
      if (filters.bedrooms) queryFilters.bedrooms = filters.bedrooms;
      if (filters.guests) queryFilters.guests = filters.guests;
      if (filters.checkIn) queryFilters.checkIn = filters.checkIn;
      if (filters.checkOut) queryFilters.checkOut = filters.checkOut;
      if (filters.amenities.length > 0) {
        queryFilters.amenities = filters.amenities.join(",");
      }

      const data = await propertyService.getProperties(queryFilters);
      setProperties(data.data);
    } catch (error) {
      console.error("Failed to load properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      q: "",
      city: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      guests: "",
      checkIn: "",
      checkOut: "",
      amenities: [],
    });
  };

  const activeFilterCount = Object.values(filters).filter(
    (val) => val && (Array.isArray(val) ? val.length > 0 : true),
  ).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content - Minimalist approach, no hero banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">
        {/* Mobile Filter Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {filters.city ? `Stays in ${filters.city}` : "Explore Stays"}
            </h2>
            <p className="text-gray-600 text-sm mt-1">
              {properties.length}{" "}
              {properties.length === 1 ? "property" : "properties"}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full hover:shadow-md transition"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Filters</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#FF5A5F] text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar Filters */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-24">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
              />
            </div>
          </div>

          {/* Property Grid */}
          <div className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {filters.city
                    ? `Stays in ${filters.city}`
                    : "Explore All Stays"}
                </h2>
                <p className="text-gray-600 mt-1">
                  {properties.length}{" "}
                  {properties.length === 1 ? "property" : "properties"}{" "}
                  available
                </p>
              </div>

              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-[#FF5A5F] hover:underline"
                >
                  Clear all filters
                </button>
              )}
            </div>

            {/* Property Grid */}
            <PropertyGrid properties={properties} loading={loading} />
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-xl overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
              />
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 px-6 py-3 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#E0484D] transition font-medium"
              >
                Show {properties.length} properties
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
