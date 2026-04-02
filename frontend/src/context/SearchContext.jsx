import { createContext, useContext, useEffect, useState } from "react";
import propertyService from "../api/propertyService";

const SearchContext = createContext(null);

export const SearchProvider = ({ children }) => {
  const [cities, setCities] = useState([]);

  useEffect(() => {
    propertyService
      .getCities()
      .then((res) => setCities(res.data || []))
      .catch(() => setCities([]));
  }, []);

  return (
    <SearchContext.Provider value={{ cities }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearchContext = () => {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearchContext must be used inside SearchProvider");
  return ctx;
};

export default SearchContext;
