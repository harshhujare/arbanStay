import { useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import propertyService from "../../api/propertyService";
import PropertyGrid from "../../components/Property/PropertyGrid";
import FilterSidebar from "../../components/Property/FilterSidebar";
import { useSearch } from "../../hooks/useSearch";
import { useCachedFetch } from "../../hooks/useCachedFetch";
import { CACHE_TTL } from "../../utils/cache";

export default function HomePage() {
  const { filters, setFilter, setFilterDebounced, setPage, clearFilters } = useSearch();
  const [showFilters, setShowFilters] = useState(() => window.innerWidth >= 1024);

  // Build a stable, filter-aware cache key so each unique search is cached separately
  const cacheKey = "properties_" + JSON.stringify({
    q:         filters.q        || "",
    city:      filters.city     || "",
    minPrice:  filters.minPrice || "",
    maxPrice:  filters.maxPrice || "",
    bedrooms:  filters.bedrooms || "",
    guests:    filters.guests   || "",
    amenities: filters.amenities.join(","),
    page:      filters.page     || "1",
  });

  // Fetcher — only called on cache miss or explicit refresh()
  const fetcher = async () => {
    const queryFilters = {};
    if (filters.q)        queryFilters.q        = filters.q       ;
    if (filters.city)     queryFilters.city     = filters.city    ;
    if (filters.minPrice) queryFilters.minPrice = filters.minPrice;
    if (filters.maxPrice) queryFilters.maxPrice = filters.maxPrice;
    if (filters.bedrooms) queryFilters.bedrooms = filters.bedrooms;
    if (filters.guests)   queryFilters.guests   = filters.guests;
    if (filters.amenities.length > 0) queryFilters.amenities = filters.amenities.join(",");
    queryFilters.page  = filters.page  || "1";
    queryFilters.limit = "20";
    return propertyService.getProperties(queryFilters);
  };

  const { data, loading } = useCachedFetch(cacheKey, fetcher, {
    ttl: CACHE_TTL.PROPERTIES_LIST,
  });

  const properties = data?.data       || [];
  const totalPages = data?.totalPages  || 1;
  const totalCount = data?.count       || 0;

  const handleFilterChange = (newFilters) => {
    if (newFilters.city     !== filters.city)     setFilter("city",     newFilters.city);
    if (newFilters.minPrice !== filters.minPrice) setFilter("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice !== filters.maxPrice) setFilter("maxPrice", newFilters.maxPrice);
    if (newFilters.bedrooms !== filters.bedrooms) setFilter("bedrooms", newFilters.bedrooms);
    const aNew = (newFilters.amenities || []).join(",");
    const aOld = filters.amenities.join(",");
    if (aNew !== aOld) setFilter("amenities", newFilters.amenities);
  };

  const activeFilterCount = [
    filters.q, filters.city, filters.minPrice, filters.maxPrice, filters.bedrooms,
  ].filter(Boolean).length + (filters.amenities.length > 0 ? 1 : 0);

  const currentPage = parseInt(filters.page) || 1;

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-primary)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-20">

        {/* Desktop Filter Toggle */}
        <div className="hidden lg:flex items-center justify-between mb-6">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:shadow-md transition"
            style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">{showFilters ? "Hide Filters" : "Show Filters"}</span>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 bg-[#FF5A5F] text-white text-xs rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>
              {filters.city ? `Stays in ${filters.city}` : "Explore Stays"}
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              {totalCount} {totalCount === 1 ? "property" : "properties"}
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 rounded-full hover:shadow-md transition"
            style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
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
          {/* Desktop Sidebar */}
          {showFilters && (
            <div className="hidden lg:block w-80 flex-shrink-0">
              <div className="sticky top-24">
                <FilterSidebar
                  filters={filters}
                  onFilterChange={handleFilterChange}
                  onClear={clearFilters}
                  onKeywordChange={(val) => setFilterDebounced("q", val)}
                />
              </div>
            </div>
          )}

          {/* Property Grid */}
          <div className="flex-1">
            {/* Desktop Header */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold" style={{ color: "var(--text-primary)" }}>
                  {filters.city ? `Stays in ${filters.city}` : "Explore All Stays"}
                </h2>
                <p className="mt-1" style={{ color: "var(--text-secondary)" }}>
                  {totalCount} {totalCount === 1 ? "property" : "properties"} available
                </p>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-sm text-[#FF5A5F] hover:underline">
                  Clear all filters
                </button>
              )}
            </div>

            <PropertyGrid properties={properties} loading={loading} />

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-10">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                    .reduce((acc, p, idx, arr) => {
                      if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
                      acc.push(p);
                      return acc;
                    }, [])
                    .map((item, idx) =>
                      item === "..." ? (
                        <span key={`ellipsis-${idx}`} className="px-2 text-sm" style={{ color: "var(--text-muted)" }}>…</span>
                      ) : (
                        <button
                          key={item}
                          onClick={() => setPage(item)}
                          className={`w-9 h-9 rounded-full text-sm font-medium transition ${
                            item === currentPage
                              ? "bg-[#FF5A5F] text-white"
                              : ""
                          }`}
                          style={item !== currentPage ? { border: "1px solid var(--border-color)", color: "var(--text-primary)" } : {}}
                        >
                          {item}
                        </button>
                      )
                    )}
                </div>

                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium hover:shadow-md transition disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar (modal) */}
      {showFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm shadow-xl overflow-y-auto"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold" style={{ color: "var(--text-primary)" }}>Filters</h3>
                <button
                  onClick={() => setShowFilters(false)}
                  style={{ color: "var(--text-secondary)" }}
                >
                  ✕
                </button>
              </div>
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={clearFilters}
                onKeywordChange={(val) => setFilterDebounced("q", val)}
              />
              <button
                onClick={() => setShowFilters(false)}
                className="w-full mt-6 px-6 py-3 bg-[#FF5A5F] text-white rounded-lg hover:bg-[#E0484D] transition font-medium"
              >
                Show {totalCount} properties
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
