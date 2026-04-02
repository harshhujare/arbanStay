import React, { useState, useRef, useEffect, useMemo } from "react";
import { SearchIcon, X, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Fuse from "fuse.js";
import { useSearchContext } from "../../../context/SearchContext";

const SearchBar = ({ isAtTop = true }) => {
  const navigate = useNavigate();
  const { cities } = useSearchContext();

  const [isExpanded, setIsExpanded] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  const wrapperRef = useRef(null);

  const fuse = useMemo(
    () => new Fuse(cities, { threshold: 0.4, includeScore: true }),
    [cities]
  );

  const filteredCities = useMemo(() => {
    if (!cityQuery.trim()) return cities.slice(0, 6);
    return fuse.search(cityQuery).map((r) => r.item).slice(0, 6);
  }, [cityQuery, fuse, cities]);

  const handleSearch = () => {
    if (cityQuery.trim()) {
      navigate(`/?city=${encodeURIComponent(cityQuery.trim())}`);
    }
    setShowSuggestions(false);
    setIsExpanded(false);
  };

  const handleCitySelect = (city) => {
    setCityQuery(city);
    setShowSuggestions(false);
    setIsExpanded(false);
    navigate(`/?city=${encodeURIComponent(city)}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SuggestionList = () =>
    showSuggestions && filteredCities.length > 0 ? (
      <div
        className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl z-[100] overflow-hidden"
        style={{ background: "var(--bg-card)", border: "1px solid var(--border-color)" }}
      >
        <div className="max-h-72 overflow-y-auto p-2">
          {filteredCities.map((city) => (
            <button
              key={city}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-lg transition text-left"
              style={{ color: "var(--text-primary)" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              onMouseDown={(e) => {
                e.preventDefault();
                handleCitySelect(city);
              }}
            >
              <div className="p-2 rounded-lg flex-shrink-0" style={{ background: "var(--bg-secondary)" }}>
                <MapPin size={15} style={{ color: "var(--text-secondary)" }} />
              </div>
              <span className="font-medium text-sm">{city}</span>
            </button>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <div className="flex items-center relative w-full md:w-auto">

      {/* ─── Mobile: collapsed pill ─── */}
      <button
        className={`md:hidden flex items-center gap-2 rounded-full px-4 py-2 shadow-sm transition-all duration-300 w-full ${
          isExpanded ? "opacity-0 pointer-events-none absolute" : "opacity-100"
        }`}
        style={{ background: "var(--bg-secondary)", color: "var(--text-secondary)" }}
        onClick={() => setIsExpanded(true)}
        aria-label="Search"
      >
        <SearchIcon size={16} className="text-[#FF385c]" />
        <span className="text-sm font-medium flex-1 text-left">
          {cityQuery || "Search destinations"}
        </span>
      </button>

      {/* ─── Mobile: full-screen overlay ─── */}
      <div
        className={`md:hidden fixed inset-0 z-[60] flex flex-col gap-4 p-4 transition-all duration-300 overflow-y-auto ${
          isExpanded
            ? "opacity-100 visible translate-y-0"
            : "opacity-0 invisible translate-y-4 pointer-events-none"
        }`}
        style={{ background: "var(--bg-card)" }}
      >
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Search Destinations</h2>
          <button
            onClick={() => setIsExpanded(false)}
            className="p-2 rounded-full transition"
            style={{ color: "var(--text-secondary)" }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold uppercase" style={{ color: "var(--text-muted)" }}>Destination</label>
          <div className="flex items-center gap-3 rounded-lg px-4 py-3" style={{ background: "var(--bg-secondary)" }}>
            <MapPin size={18} style={{ color: "var(--text-secondary)" }} />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none placeholder-gray-500"
              style={{ color: "var(--text-primary)" }}
              placeholder="Search city..."
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
            />
          </div>

          {/* Mobile suggestions */}
          {filteredCities.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  className="flex items-center gap-3 p-3 rounded-lg transition text-left"
                  style={{ color: "var(--text-primary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => handleCitySelect(city)}
                >
                  <MapPin size={16} style={{ color: "var(--text-muted)" }} />
                  <span className="font-medium">{city}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          className="w-full mt-4 px-6 py-3 bg-[#FF385c] text-white rounded-lg hover:bg-[#e02e4d] transition font-medium"
        >
          Search
        </button>
      </div>

      {/* ─── Desktop / Tablet: dynamic search bar ─── */}
      <div
        ref={wrapperRef}
        className="hidden md:block relative transition-all duration-500 ease-in-out"
        style={{ width: isAtTop ? "min(850px, 90vw)" : "min(374px, 60vw)" }}
      >
        {/* The pill */}
        <div
          className="flex items-center w-full rounded-full shadow-sm hover:shadow-md overflow-hidden transition-all duration-500"
          style={{
            height: isAtTop ? "66px" : "46px",
            padding: "0 8px",
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
          }}
        >
          {isAtTop ? (
            <>
              <div className="flex-1 flex items-center px-6 py-2">
                <input
                  type="text"
                  className="flex-1 outline-none bg-transparent text-base min-w-0 placeholder-gray-400"
                  style={{ color: "var(--text-primary)" }}
                  placeholder="Search destinations..."
                  value={cityQuery}
                  onChange={(e) => {
                    setCityQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
            <>
              <SearchIcon size={16} className="flex-shrink-0 ml-2" style={{ color: "var(--text-secondary)" }} />
              <input
                type="text"
                className="flex-1 outline-none text-sm px-3 min-w-0 placeholder-gray-400 bg-transparent"
                style={{ color: "var(--text-primary)" }}
                placeholder="Search destinations..."
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
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
        </div>

        {/* Dropdown rendered OUTSIDE the overflow-hidden pill */}
        <SuggestionList />
      </div>
    </div>
  );
};

export default SearchBar;
