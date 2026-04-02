import { useState } from "react";

const AMENITIES = [
  "WiFi", "Air Conditioning", "Kitchen", "TV", "Parking",
  "Pool", "Gym", "Washer", "Workspace", "Balcony",
];

export default function FilterSidebar({ filters, onFilterChange, onClear, onKeywordChange }) {
  const [keywordInput, setKeywordInput] = useState(filters.q || "");

  const handlePriceChange = (field, value) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    onFilterChange({ ...filters, amenities: newAmenities });
  };

  const handleBedroomsChange = (value) => {
    onFilterChange({ ...filters, bedrooms: value });
  };

  const handleKeywordChange = (e) => {
    const val = e.target.value;
    setKeywordInput(val);
    if (onKeywordChange) onKeywordChange(val);
  };

  const inputStyle = {
    background: "var(--bg-input)",
    border: "1px solid var(--border-color)",
    color: "var(--text-primary)",
  };

  return (
    <div className="space-y-8">
      {/* Keyword Search */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Keyword Search</h3>
        <div className="relative">
          <input
            type="text"
            value={keywordInput}
            onChange={handleKeywordChange}
            placeholder="e.g. spacious, sea view, balcony..."
            className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
            style={inputStyle}
          />
          <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Searches property titles &amp; descriptions</p>
        </div>
      </div>

      <div className="h-px" style={{ background: "var(--border-color)" }} />

      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Price Range</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Minimum Price (₹)</label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              placeholder="500" min="0" step="500"
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-sm mb-1" style={{ color: "var(--text-secondary)" }}>Maximum Price (₹)</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              placeholder="10000" min="0" step="500"
              className="w-full px-4 py-2 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Quick Price Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: "Under ₹2K", min: "", max: "2000" },
            { label: "₹2K-₹4K", min: "2000", max: "4000" },
            { label: "₹4K-₹6K", min: "4000", max: "6000" },
            { label: "₹6K+", min: "6000", max: "" },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => onFilterChange({ ...filters, minPrice: range.min, maxPrice: range.max })}
              className="px-3 py-2 text-sm rounded-lg hover:border-[#FF5A5F] hover:bg-red-50 transition"
              style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)" }}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px" style={{ background: "var(--border-color)" }} />

      {/* Bedrooms */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Bedrooms</h3>
        <div className="grid grid-cols-4 gap-2">
          {["Any", "1", "2", "3+"].map((option) => {
            const value = option === "Any" ? "" : option.replace("+", "");
            const isActive = filters.bedrooms === value;
            return (
              <button
                key={option}
                onClick={() => handleBedroomsChange(value)}
                className={`px-4 py-2 border-2 rounded-lg transition-all font-medium ${
                  isActive ? "border-[#FF5A5F] bg-red-50 text-[#FF5A5F]" : ""
                }`}
                style={!isActive ? { border: "2px solid var(--border-color)", color: "var(--text-primary)" } : {}}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px" style={{ background: "var(--border-color)" }} />

      {/* Amenities */}
      <div>
        <h3 className="text-lg font-semibold mb-4" style={{ color: "var(--text-primary)" }}>Amenities</h3>
        <div className="space-y-2">
          {AMENITIES.map((amenity) => {
            const isSelected = filters.amenities.includes(amenity);
            return (
              <label key={amenity} className="flex items-center gap-3 cursor-pointer group">
                <div
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                    isSelected ? "border-[#FF5A5F] bg-[#FF5A5F]" : ""
                  }`}
                  style={!isSelected ? { border: "2px solid var(--border-color)" } : {}}
                >
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAmenity(amenity)}
                  className="sr-only"
                />
                <span style={{ color: "var(--text-secondary)" }}>{amenity}</span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px" style={{ background: "var(--border-color)" }} />

      {/* Clear Button */}
      <button
        onClick={() => { setKeywordInput(""); onClear(); }}
        className="w-full px-6 py-3 rounded-lg transition font-medium"
        style={{ border: "1px solid var(--border-color)", color: "var(--text-primary)", background: "var(--bg-card)" }}
      >
        Clear all filters
      </button>
    </div>
  );
}
