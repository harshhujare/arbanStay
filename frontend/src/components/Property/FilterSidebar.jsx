import { useState } from "react";

const AMENITIES = [
  "WiFi",
  "Air Conditioning",
  "Kitchen",
  "TV",
  "Parking",
  "Pool",
  "Gym",
  "Washer",
  "Workspace",
  "Balcony",
];

export default function FilterSidebar({ filters, onFilterChange, onClear }) {
  const handlePriceChange = (field, value) => {
    onFilterChange({
      ...filters,
      [field]: value,
    });
  };

  const toggleAmenity = (amenity) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];

    onFilterChange({
      ...filters,
      amenities: newAmenities,
    });
  };

  const handleBedroomsChange = (value) => {
    onFilterChange({
      ...filters,
      bedrooms: value,
    });
  };

  return (
    <div className="space-y-8">
      {/* Price Range */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Price Range
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Minimum Price (₹)
            </label>
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              placeholder="500"
              min="0"
              step="500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-700 mb-1">
              Maximum Price (₹)
            </label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              placeholder="10000"
              min="0"
              step="500"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent"
            />
          </div>
        </div>

        {/* Price Range Buttons */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          {[
            { label: "Under ₹2K", min: "", max: "2000" },
            { label: "₹2K-₹4K", min: "2000", max: "4000" },
            { label: "₹4K-₹6K", min: "4000", max: "6000" },
            { label: "₹6K+", min: "6000", max: "" },
          ].map((range) => (
            <button
              key={range.label}
              onClick={() => {
                handlePriceChange("minPrice", range.min);
                handlePriceChange("maxPrice", range.max);
              }}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:border-[#FF5A5F] hover:bg-red-50 transition"
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Bedrooms */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Bedrooms</h3>
        <div className="grid grid-cols-4 gap-2">
          {["Any", "1", "2", "3+"].map((option) => {
            const value = option === "Any" ? "" : option.replace("+", "");
            const isActive = filters.bedrooms === value;

            return (
              <button
                key={option}
                onClick={() => handleBedroomsChange(value)}
                className={`px-4 py-2 border-2 rounded-lg transition-all font-medium ${
                  isActive
                    ? "border-[#FF5A5F] bg-red-50 text-[#FF5A5F]"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Amenities */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h3>
        <div className="space-y-2">
          {AMENITIES.map((amenity) => {
            const isSelected = filters.amenities.includes(amenity);

            return (
              <label
                key={amenity}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-[#FF5A5F] bg-[#FF5A5F]"
                      : "border-gray-300 group-hover:border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={3}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleAmenity(amenity)}
                  className="sr-only"
                />
                <span className="text-gray-700 group-hover:text-gray-900">
                  {amenity}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-gray-200" />

      {/* Clear Button */}
      <button
        onClick={onClear}
        className="w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium text-gray-700"
      >
        Clear all filters
      </button>
    </div>
  );
}
