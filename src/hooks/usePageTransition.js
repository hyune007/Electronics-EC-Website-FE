import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { ROUTE_MAP } from "../routes/routesConfig/customer/routeMap";

const normalizePathname = (pathname) =>
  pathname.length > 1 && pathname.endsWith("/")
    ? pathname.slice(0, -1)
    : pathname;

const NO_FADE_ROUTE_PAIRS = new Set([
  `${ROUTE_MAP.home}->${ROUTE_MAP.product}`,
  `${ROUTE_MAP.product}->${ROUTE_MAP.home}`,
]);

export default function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();
  const previousPathRef = useRef(normalizePathname(location.pathname));

  useEffect(() => {
    const currentPath = normalizePathname(location.pathname);
    const previousPath = previousPathRef.current;
    previousPathRef.current = currentPath;

    const shouldSkipFade = NO_FADE_ROUTE_PAIRS.has(
      `${previousPath}->${currentPath}`,
    );

    if (shouldSkipFade) {
      setIsTransitioning(false);
      return;
    }

    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 220);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isTransitioning;
}
