# Search Functionality Architecture & Implementation

This document outlines the current state and architecture of the search functionality in the UrbanStay application, following the recent UI/UX overhaul to an Airbnb-style search experience.

## 1. Routing & Flow

Search has been separated from the Home Page into a dedicated route.

*   **Dedicated Route (`/search`)**: All city-based searches and explicit queries route to `SearchResultsPage.jsx`.
*   **Navigation & Redirects**: 
    *   The `SearchBar` in the Header navigates the user to `/search?city=X`.
    *   The Home Page (`HomePage.jsx`) intercepts any incoming `?city=` parameter and automatically redirects the user to `/search?city=X` using `useSearchParams`. 
    *   This preserves the Home Page purely as an unfiltered browsing gallery while pushing targeted queries to the proper map-based results layout.

## 2. Airbnb-Style Map & List Layout

The `SearchResultsPage.jsx` implements a split-panel design for a seamless browsing experience.

*   **Desktop View**: 
    *   **Left Panel**: A scrollable list of filtered properties (`PropertyGrid`), taking up ~55% of the viewport width. 
    *   **Right Panel**: A sticky, interactive map displaying markers for properties in the current search query.
*   **Mobile View**:
    *   The layout stacks vertically. The map is hidden by default.
    *   A floating sticky "Show Map" FAB allows users to toggle the map over the whole screen using a slick animation (`.search-map-mobile-overlay`).
*   **Modern Aesthetics**: Maps and property cards utilize a sleek modern design, featuring deep rounded corners (`border-radius: 24px`) via dedicated CSS overrides in `SearchResultsPage.css` and fixed stacking contexts (`z-index: 0` on map panes) to prevent over-drawing on dropdowns.

## 3. Interactive Map (React-Leaflet)

The search results heavily leverage `react-leaflet` to map property coordinates. 

*   **Custom Price Markers**: Standard Leaflet pins have been replaced by custom HTML DivIcons that display the real-time property price natively on the map (e.g., a white pill box with the text `₹4,000`).
*   **Auto-fit Bounds**: The map includes a helper `<FitBounds>` component that calculates the bounding box of the currently displayed properties and animates the zoom/pan so all markers are visible simultaneously.
*   **Popups**: Clicking on a price marker opens a custom popup card displaying the property's thumbnail, title, location, and price, which dynamically links out to the property detail page.

## 4. State Management & URL Sync

Filters are tied to the URL, making search queries natively shareable and bookmarkable.

*   **`useSearch` Hook**: Consumes `react-router-dom`'s `useSearchParams` to act as the single source of truth for the active query parameters (`city`, `minPrice`, `maxPrice`, `bedrooms`, `amenities`, `page`). 
*   **Debouncing**: Built-in debouncing (`setFilterDebounced`) handles rapid user text inputs without thrashing the backend.
*   **Data Fetching (`useCachedFetch`)**: Derives a cache key based on the URL parameters and manages local data fetching / cache invalidation.

## 5. Performance Improvements 
*   **Dynamic Cities**: The `SearchProvider` fires a `distinct` query to MongoDB on app load to pull only valid cities containing active properties to populate the frontend autocomplete options, caching it in the Context.
*   **Pagination & Limits**: Returns the top 20 documents chunked by limit bounds for instant renders.

---

### Future Roadmap Ideas
*   Implement real-time geographic boundary queries utilizing MongoDB Geospatial operations (`$geoWithin`) calculated from the user dynamically pivoting the Leaflet map.
*   Upgrade fuzzy text searching logic across descriptions/amenities.