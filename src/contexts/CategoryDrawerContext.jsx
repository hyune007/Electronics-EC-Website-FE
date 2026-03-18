import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import { useLocation } from "react-router-dom";

const CategoryDrawerContext = createContext(null);

export function CategoryDrawerProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const openDrawer = useCallback(() => setIsOpen(true), []);
  const closeDrawer = useCallback(() => setIsOpen(false), []);
  const toggleDrawer = useCallback(() => setIsOpen((prev) => !prev), []);

  const value = useMemo(
    () => ({ isOpen, openDrawer, closeDrawer, toggleDrawer }),
    [isOpen, openDrawer, closeDrawer, toggleDrawer],
  );

  // Close the drawer automatically when the route changes
  useEffect(() => {
    if (isOpen) closeDrawer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <CategoryDrawerContext.Provider value={value}>
      {children}
    </CategoryDrawerContext.Provider>
  );
}

export function useCategoryDrawer() {
  const context = useContext(CategoryDrawerContext);

  if (!context) {
    throw new Error(
      "useCategoryDrawer must be used within CategoryDrawerProvider",
    );
  }

  return context;
}
