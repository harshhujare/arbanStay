import { useState, useEffect } from "react";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";
import propertyService from "../../api/propertyService";
import PropertyGrid from "../../components/Property/PropertyGrid";
import FilterSidebar from "../../components/Property/FilterSidebar";

export default function PropertiesPage() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    city: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    amenities: [],
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      const queryFilters = {};

      if (filters.city) queryFilters.city = filters.city;
      if (filters.minPrice) queryFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) queryFilters.maxPrice = filters.maxPrice;
      if (filters.bedrooms) queryFilters.bedrooms = filters.bedrooms;
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

  const handleSearch = (e) => {
    e.preventDefault();
    setFilters({ ...filters, city: searchQuery });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      city: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      amenities: [],
    });
    setSearchQuery("");
  };

  const activeFilterCount = Object.values(filters).filter(
    (val) => val && (Array.isArray(val) ? val.length > 0 : true),
  ).length;

  return (
    <div className="min-h-screen bg-white">
      {/* Search Bar */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex gap-3">
            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by city... (e.g., Mumbai, Pune)"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#FF5A5F] text-white rounded-full hover:bg-[#E0484D] transition"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:shadow-md transition"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-6 h-6 bg-[#FF5A5F] text-white text-xs rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <div className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-32">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
              />
            </div>
          </div>

          {/* Property Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
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
