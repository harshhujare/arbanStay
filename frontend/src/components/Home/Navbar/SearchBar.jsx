import React, { useState, useRef, useEffect } from "react";
import { SearchIcon, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const cities = [
  "Kolhapur",
  "Pune",
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Goa",
  "Jaipur",
  "Hyderabad",
];

const SearchBar = ({ isAtTop = true }) => {
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const searchBarRef = useRef(null);

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(cityQuery.toLowerCase()),
  );

  // Handle search submission
  const handleSearch = () => {
    if (cityQuery.trim()) {
      navigate(`/?city=${encodeURIComponent(cityQuery.trim())}`);
    }
    setShowCitySuggestions(false);
    setIsExpanded(false);
  };

  const handleCitySelect = (city) => {
    setCityQuery(city);
    setShowCitySuggestions(false);
    // Immediately search when city is selected
    navigate(`/?city=${encodeURIComponent(city)}`);
    setIsExpanded(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchBarRef.current &&
        !searchBarRef.current.contains(event.target)
      ) {
        setShowCitySuggestions(false);
      }
    };

    if (showCitySuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCitySuggestions]);

  return (
    <div className="flex items-center relative w-full md:w-auto">
      {/* Mobile View: Search Pill (Collapsed) */}
      <button
        className={`md:hidden flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2 shadow-sm transition-all duration-300 w-full ${
          isExpanded ? "opacity-0 pointer-events-none absolute" : "opacity-100"
        }`}
        onClick={() => setIsExpanded(true)}
        aria-label="Search"
      >
        <SearchIcon size={16} className="text-[#FF385c]" />
        <div className="flex-1 text-left">
          <span className="text-sm font-medium text-gray-600">
            {cityQuery || "Search destinations"}
          </span>
        </div>
      </button>

      {/* Mobile View: Expanded Search Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-white z-[60] flex flex-col gap-4 p-4 transition-all duration-300 overflow-y-auto ${
          isExpanded
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-4 pointer-events-none"
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold text-gray-800">
            Search Destinations
          </h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>

        {/* City Search */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase">
            Destination
          </label>
          <div className="flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-3">
            <MapPin size={18} className="text-gray-500" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-500"
              placeholder="Search city..."
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
            />
          </div>

          {/* City Suggestions */}
          {cityQuery && filteredCities.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {filteredCities.slice(0, 5).map((city) => (
                <button
                  key={city}
                  className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-left"
                  onClick={() => handleCitySelect(city)}
                >
                  <MapPin size={16} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">{city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          className="w-full mt-4 px-6 py-3 bg-[#FF385c] text-white rounded-lg hover:bg-[#e02e4d] transition font-medium"
        >
          Search
        </button>
      </div>

      {/* Desktop/Tablet View: Dynamic Search Bar */}
      <div
        ref={searchBarRef}
        className="hidden md:flex items-center rounded-full shadow-sm border border-gray-300 hover:shadow-md transition-all duration-500 ease-in-out bg-white overflow-hidden relative"
        style={{
          width: isAtTop ? "min(850px, 90vw)" : "min(374px, 60vw)",
          height: isAtTop ? "66px" : "46px",
          padding: isAtTop ? "0 8px" : "0 8px",
        }}
      >
        {/* Expanded View - Shows full search when at top */}
        {isAtTop ? (
          <>
            {/* City Search */}
            <div className="flex-1 flex items-center gap-3 px-6 py-2">
              <input
                type="text"
                className="flex-1 outline-none bg-transparent text-base text-gray-700 placeholder-gray-400 min-w-0"
                placeholder="Search destinations..."
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setShowCitySuggestions(true);
                }}
                onFocus={() => setShowCitySuggestions(true)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>

            <button
              onClick={handleSearch}
              className="h-12 w-12 text-white bg-[#FF385c] rounded-full flex items-center justify-center hover:bg-[#e02e4d] transition flex-shrink-0 ml-2"
              aria-label="Search"
            >
              <SearchIcon size={18} />
            </button>
          </>
        ) : (
          /* Compact View - Shows minimal search when scrolled */
          <>
            <SearchIcon
              size={16}
              className="text-gray-500 flex-shrink-0 ml-2"
            />

            <input
              type="text"
              className="flex-1 outline-none text-sm text-gray-700 placeholder-gray-400 px-3 min-w-0"
              placeholder="Search destinations..."
              value={cityQuery}
              onChange={(e) => {
                setCityQuery(e.target.value);
              }}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            />

            <button
              onClick={handleSearch}
              className="h-8 w-8 text-white bg-[#FF385c] rounded-full flex items-center justify-center hover:bg-[#e02e4d] transition flex-shrink-0"
              aria-label="Search"
            >
              <SearchIcon size={14} />
            </button>
          </>
        )}

        {/* Desktop City Suggestions Dropdown */}
        {isAtTop && showCitySuggestions && cityQuery && (
          <div className="absolute top-full left-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden max-w-md z-50 w-full">
            <div className="max-h-80 overflow-y-auto p-2">
              {filteredCities.length > 0 ? (
                filteredCities.map((city) => (
                  <button
                    key={city}
                    className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition text-left"
                    onClick={() => handleCitySelect(city)}
                  >
                    <div className="bg-gray-100 p-2 rounded-lg">
                      <MapPin size={16} className="text-gray-600" />
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      {city}
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No destinations found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchBar;
