import { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Map,
  X,
  SlidersHorizontal,
  MapPin,
  Eye,
  EyeOff,
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

import propertyService from "../../api/propertyService";
import PropertyGrid from "../../components/Property/PropertyGrid";
import FilterSidebar from "../../components/Property/FilterSidebar";
import { useSearch } from "../../hooks/useSearch";
import { useCachedFetch } from "../../hooks/useCachedFetch";
import { CACHE_TTL } from "../../utils/cache";

import "./SearchResultsPage.css";

// ── Fix Leaflet default marker icon ──
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// ── Price marker icon factory ──
function createPriceIcon(price) {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

  return L.divIcon({
    className: "",
    html: `<div class="price-marker">${formatted}</div>`,
    iconSize: [80, 30],
    iconAnchor: [40, 15],
  });
}

// ── Helper: adjust map bounds to fit markers ──
function FitBounds({ positions }) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) return;
    if (positions.length === 1) {
      map.setView(positions[0], 13, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(positions);
    map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14, animate: true });
  }, [positions, map]);

  return null;
}

export default function SearchResultsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { filters, setFilter, setFilterDebounced, setPage, clearFilters } =
    useSearch();

  const [showMap, setShowMap] = useState(true);
  const [showMobileMap, setShowMobileMap] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);

  // ── Build cache key ──
  const cacheKey =
    "search_" +
    JSON.stringify({
      q: filters.q || "",
      city: filters.city || "",
      minPrice: filters.minPrice || "",
      maxPrice: filters.maxPrice || "",
      bedrooms: filters.bedrooms || "",
      guests: filters.guests || "",
      amenities: filters.amenities.join(","),
      page: filters.page || "1",
    });

  // ── Fetcher ──
  const fetcher = async () => {
    const queryFilters = {};
    if (filters.q) queryFilters.q = filters.q;
    if (filters.city) queryFilters.city = filters.city;
    if (filters.minPrice) queryFilters.minPrice = filters.minPrice;
    if (filters.maxPrice) queryFilters.maxPrice = filters.maxPrice;
    if (filters.bedrooms) queryFilters.bedrooms = filters.bedrooms;
    if (filters.guests) queryFilters.guests = filters.guests;
    if (filters.amenities.length > 0)
      queryFilters.amenities = filters.amenities.join(",");
    queryFilters.page = filters.page || "1";
    queryFilters.limit = "20";
    return propertyService.getProperties(queryFilters);
  };

  const { data, loading } = useCachedFetch(cacheKey, fetcher, {
    ttl: CACHE_TTL.PROPERTIES_LIST,
  });

  const properties = data?.data || [];
  const totalPages = data?.totalPages || 1;
  const totalCount = data?.count || 0;
  const currentPage = parseInt(filters.page) || 1;

  // ── Compute map positions ──
  const mapPositions = useMemo(() => {
    return properties
      .filter(
        (p) =>
          p.coordinates?.latitude &&
          p.coordinates?.longitude &&
          !isNaN(p.coordinates.latitude) &&
          !isNaN(p.coordinates.longitude)
      )
      .map((p) => ({
        id: p._id,
        lat: p.coordinates.latitude,
        lng: p.coordinates.longitude,
        title: p.title,
        price: p.rentAmount || p.pricePerNight || 0,
        city: p.location?.city || "",
        image: p.images?.[0] || "",
      }));
  }, [properties]);

  const latLngs = useMemo(
    () => mapPositions.map((p) => [p.lat, p.lng]),
    [mapPositions]
  );

  const defaultCenter = useMemo(() => {
    if (latLngs.length > 0) return latLngs[0];
    return [19.076, 72.8777]; // Mumbai default
  }, [latLngs]);

  // ── Filter change handler ──
  const handleFilterChange = (newFilters) => {
    if (newFilters.city !== filters.city) setFilter("city", newFilters.city);
    if (newFilters.minPrice !== filters.minPrice)
      setFilter("minPrice", newFilters.minPrice);
    if (newFilters.maxPrice !== filters.maxPrice)
      setFilter("maxPrice", newFilters.maxPrice);
    if (newFilters.bedrooms !== filters.bedrooms)
      setFilter("bedrooms", newFilters.bedrooms);
    const aNew = (newFilters.amenities || []).join(",");
    const aOld = filters.amenities.join(",");
    if (aNew !== aOld) setFilter("amenities", newFilters.amenities);
  };

  const activeFilterCount = [
    filters.q,
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.bedrooms,
  ].filter(Boolean).length + (filters.amenities.length > 0 ? 1 : 0);

  // ── Pagination helpers ──
  const pageNumbers = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
      .filter(
        (p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1
      )
      .reduce((acc, p, idx, arr) => {
        if (idx > 0 && p - arr[idx - 1] > 1) acc.push("...");
        acc.push(p);
        return acc;
      }, []);
  }, [totalPages, currentPage]);

  // ── Shared map component ──
  const renderMap = () => (
    <MapContainer
      center={defaultCenter}
      zoom={11}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds positions={latLngs} />
      {mapPositions.map((pos) => (
        <Marker
          key={pos.id}
          position={[pos.lat, pos.lng]}
          icon={createPriceIcon(pos.price)}
          eventHandlers={{
            mouseover: () => setHoveredPropertyId(pos.id),
            mouseout: () => setHoveredPropertyId(null),
          }}
        >
          <Popup className="search-map-popup">
            <div
              className="map-popup-card"
              onClick={() => navigate(`/property/${pos.id}`)}
            >
              {pos.image && (
                <img src={pos.image} alt={pos.title} loading="lazy" />
              )}
              <div className="popup-info">
                <div className="popup-title">{pos.title}</div>
                <div className="popup-location">
                  <MapPin
                    style={{
                      width: 12,
                      height: 12,
                      display: "inline",
                      verticalAlign: "middle",
                      marginRight: 4,
                    }}
                  />
                  {pos.city}
                </div>
                <div className="popup-price">
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(pos.price)}{" "}
                  <span style={{ fontWeight: 400, fontSize: "0.75rem" }}>
                    / night
                  </span>
                </div>
              </div>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );

  return (
    <div className="search-page">
      {/* ── Header ── */}
      <div className="search-header" style={{ marginTop: "80px" }}>
        <div className="search-header-left">
          <h1 className="search-header-title">
            {filters.city ? `Stays in ${filters.city}` : "Search Results"}
          </h1>
          <span className="search-header-count">
            {loading
              ? "Searching..."
              : `${totalCount} ${totalCount === 1 ? "property" : "properties"} found`}
          </span>
        </div>

        <div className="search-header-actions">
          {/* Active filter chips */}
          {filters.city && (
            <span className="filter-chip active">
              {filters.city}
              <span
                className="chip-remove"
                onClick={() => setFilter("city", "")}
              >
                <X style={{ width: 10, height: 10 }} />
              </span>
            </span>
          )}

          {filters.minPrice && (
            <span className="filter-chip active">
              Min ₹{filters.minPrice}
              <span
                className="chip-remove"
                onClick={() => setFilter("minPrice", "")}
              >
                <X style={{ width: 10, height: 10 }} />
              </span>
            </span>
          )}

          {filters.maxPrice && (
            <span className="filter-chip active">
              Max ₹{filters.maxPrice}
              <span
                className="chip-remove"
                onClick={() => setFilter("maxPrice", "")}
              >
                <X style={{ width: 10, height: 10 }} />
              </span>
            </span>
          )}

          {activeFilterCount > 1 && (
            <button className="clear-filters-link" onClick={clearFilters}>
              Clear all
            </button>
          )}

          {/* Filters button */}
          <button
            className="filter-chip"
            onClick={() => setShowFilters(true)}
          >
            <SlidersHorizontal style={{ width: 14, height: 14 }} />
            Filters
            {activeFilterCount > 0 && (
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "#FF5A5F",
                  color: "#fff",
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginLeft: 4,
                }}
              >
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* Desktop map toggle */}
          <button
            className="search-map-toggle-desktop"
            onClick={() => setShowMap((v) => !v)}
          >
            {showMap ? (
              <>
                <EyeOff style={{ width: 14, height: 14 }} /> Hide Map
              </>
            ) : (
              <>
                <Map style={{ width: 14, height: 14 }} /> Show Map
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Split layout ── */}
      <div className={`search-layout${showMap ? "" : " map-hidden"}`}>
        {/* Left panel — Property cards */}
        <div className="search-list-panel">
          {loading ? (
            <div className="search-skeleton-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="search-skeleton-card">
                  <div className="skel-img" />
                  <div className="skel-line w50" />
                  <div className="skel-line w75" />
                  <div className="skel-line w33" />
                </div>
              ))}
            </div>
          ) : properties.length === 0 ? (
            <div className="search-empty">
              <MapPin
                style={{
                  width: 48,
                  height: 48,
                  color: "var(--text-muted)",
                  marginBottom: 16,
                }}
              />
              <h3>No properties found</h3>
              <p>Try adjusting your search or filters</p>
              <button
                onClick={() => {
                  clearFilters();
                  navigate("/");
                }}
                style={{
                  padding: "10px 24px",
                  background: "#FF5A5F",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Back to Home
              </button>
            </div>
          ) : (
            <>
              <PropertyGrid properties={properties} loading={false} />

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="search-pagination">
                  <button
                    onClick={() => setPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                  >
                    <ChevronLeft style={{ width: 16, height: 16 }} />
                    Previous
                  </button>

                  {pageNumbers.map((item, idx) =>
                    item === "..." ? (
                      <span key={`ellipsis-${idx}`} className="ellipsis">
                        …
                      </span>
                    ) : (
                      <button
                        key={item}
                        onClick={() => setPage(item)}
                        className={`page-btn${item === currentPage ? " active" : ""}`}
                      >
                        {item}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setPage(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                  >
                    Next
                    <ChevronRight style={{ width: 16, height: 16 }} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right panel — Map (desktop) */}
        <div className="search-map-panel">{renderMap()}</div>
      </div>

      {/* ── Mobile map toggle FAB ── */}
      {!showMobileMap && (
        <button
          className="search-map-toggle-mobile"
          onClick={() => setShowMobileMap(true)}
        >
          <Map style={{ width: 16, height: 16 }} />
          Show Map
        </button>
      )}

      {/* ── Mobile map overlay ── */}
      {showMobileMap && (
        <div className="search-map-mobile-overlay">
          <div className="search-map-mobile-header">
            <h3>
              {filters.city ? `Map — ${filters.city}` : "Map"} ({totalCount})
            </h3>
            <button
              onClick={() => setShowMobileMap(false)}
              style={{
                padding: 8,
                borderRadius: "50%",
                border: "none",
                background: "var(--bg-hover)",
                color: "var(--text-primary)",
                cursor: "pointer",
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
          {renderMap()}
        </div>
      )}

      {/* ── Filter sidebar modal ── */}
      {showFilters && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowFilters(false)}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-sm shadow-xl overflow-y-auto"
            style={{ background: "var(--bg-card)" }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3
                  className="text-xl font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Filters
                </h3>
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
