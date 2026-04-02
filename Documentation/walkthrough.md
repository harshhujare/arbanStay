# Search System Overhaul — Walkthrough

Build status: ✅ `vite build` — exit 0 in 12.74s, no errors.

## What Changed

### Backend

| File | Change |
|---|---|
| [propertyController.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Controllers/propertyController.js) | Added [getCities](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/api/propertyService.js#17-23) (MongoDB `distinct`). Added `page`/`limit`/`skip` pagination to [getProperties](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/api/propertyService.js#8-16). Fixed text-score sort (was incorrectly spreading a string). |
| [propertyRoutes.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Routes/propertyRoutes.js) | Registered `GET /api/properties/cities` before [/:id](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/components/Property/FilterSidebar.jsx#16-188) to avoid route conflicts. |
| [Property.js](file:///c:/Documents/sold_projects/UrbanStay-1/backend/Models/Property.js) | Added second compound index `{ "location.city": 1, bedrooms: 1, price: 1 }` for the most common filter combination. |

### Frontend — New Files

| File | Purpose |
|---|---|
| [src/context/SearchContext.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/context/SearchContext.jsx) | Fetches city list once from DB on app mount and caches it. Exposes `cities[]` to any component. |
| [src/hooks/useSearch.js](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/hooks/useSearch.js) | All filter state lives in the URL (`useSearchParams`). Provides `setFilter`, `setFilterDebounced` (350ms), `setPage`, `clearFilters`. |

### Frontend — Modified Files

| File | Change |
|---|---|
| [App.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/App.jsx) | Wrapped with `<SearchProvider>` so cities are fetched once at startup. |
| [SearchBar.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/components/Home/Navbar/SearchBar.jsx) | **Hardcoded cities removed** → uses live DB list from [SearchContext](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/context/SearchContext.jsx#23-28). **Basic substring match replaced** with Fuse.js fuzzy matching (threshold 0.4). Navigates correctly to `/?city=X`. |
| [FilterSidebar.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/components/Property/FilterSidebar.jsx) | Added **Keyword Search** input at the top — feeds debounced `q` filter via new `onKeywordChange` prop. Properly resets on "Clear all". |
| [HomePage.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Home/HomePage.jsx) | Uses [useSearch](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/hooks/useSearch.js#6-78) hook (URL-driven state). Shows total count from backend. Adds smart **pagination UI** (prev/next + numbered pages with ellipsis). Removes `console.log`. |
| [propertyService.js](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/api/propertyService.js) | Added [getCities()](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/api/propertyService.js#17-23) method. |

### Removed

| File | Reason |
|---|---|
| [src/pages/Properties/PropertiesPage.jsx](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Properties/PropertiesPage.jsx) | Duplicate of [HomePage](file:///c:/Documents/sold_projects/UrbanStay-1/frontend/src/pages/Home/HomePage.jsx#8-240). Had local-only filter state (not URL-synced). Not linked from any nav element. |

---

## How To Test

Start both servers:
```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

| Test | Steps |
|---|---|
| City suggestions from DB | Click search bar → type a letter → should see real cities from the database |
| Fuzzy match | Type a misspelling (e.g. "mubai") → "Mumbai" should still appear |
| URL persistence | Search for a city, refresh the page → filter should be preserved |
| Keyword search | Open filter sidebar, type in "Keyword Search" box → waits 350ms then results update |
| Stacked filters | Set city + price range + amenity → all apply together |
| Pagination | If > 20 properties: numbered pages and Prev/Next appear |
| Clear filters | Click "Clear all filters" → URL clears, all properties shown, keyword input resets |
| Back/forward | Apply filter → back button → previous filter state restored |
