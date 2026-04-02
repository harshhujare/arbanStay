import { useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";

const DEBOUNCE_MS = 350;

/**
 * useSearch – centralises URL-based filter state for the search results page.
 *
 * All filters live in the URL query string so that:
 *  - Refreshing preserves filters
 *  - Sharing a URL shares the exact search
 *  - Back/forward browser buttons work correctly
 */
export function useSearch() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read current filter values from URL
  const filters = {
    q:         searchParams.get("q")         || "",
    city:      searchParams.get("city")      || "",
    minPrice:  searchParams.get("minPrice")  || "",
    maxPrice:  searchParams.get("maxPrice")  || "",
    bedrooms:  searchParams.get("bedrooms")  || "",
    guests:    searchParams.get("guests")    || "",
    amenities: searchParams.get("amenities")?.split(",").filter(Boolean) || [],
    page:      searchParams.get("page")      || "1",
  };

  // Generic setter – writes a single key to the URL, resets page to 1
  const setFilter = useCallback(
    (key, value) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (!value || (Array.isArray(value) && value.length === 0)) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(","));
        } else {
          next.set(key, value);
        }
        // Reset to page 1 when any filter changes (except page itself)
        if (key !== "page") next.set("page", "1");
        return next;
      });
    },
    [setSearchParams]
  );

  const setPage = useCallback(
    (page) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set("page", String(page));
        return next;
      });
    },
    [setSearchParams]
  );

  const clearFilters = useCallback(() => {
    setSearchParams({});
  }, [setSearchParams]);

  // Debounced setter – use this for text inputs (q, etc.)
  const debounceTimer = useRef(null);
  const setFilterDebounced = useCallback(
    (key, value) => {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => {
        setFilter(key, value);
      }, DEBOUNCE_MS);
    },
    [setFilter]
  );

  return { filters, setFilter, setFilterDebounced, setPage, clearFilters };
}
