import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function usePageTransition() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 220);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return isTransitioning;
}
