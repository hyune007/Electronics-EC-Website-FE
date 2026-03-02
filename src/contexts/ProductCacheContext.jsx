import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getProducts } from "../services/customer/productService.js";

const ProductCacheContext = createContext(null);

export function ProductCacheProvider({ children }) {
  const [allProducts, setAllProducts] = useState(null);
  const [loadingAll, setLoadingAll] = useState(false);
  const [errorAll, setErrorAll] = useState(null);
  const inFlight = useRef(null);

  const prefetchAllProducts = useCallback(async () => {
    if (allProducts?.length) return allProducts;
    if (inFlight.current) return inFlight.current;

    setLoadingAll(true);
    setErrorAll(null);

    const fetchPromise = (async () => {
      let page = 0;
      let done = false;
      const collected = [];

      while (!done) {
        const res = await getProducts({ p: page });
        const data = res?.data || {};
        const content = Array.isArray(data.content) ? data.content : [];
        const isLast = data.last === true;
        const totalPages = Number.isFinite(data.totalPages)
          ? data.totalPages
          : null;

        collected.push(...content);
        page += 1;

        if (isLast || content.length === 0) {
          done = true;
        } else if (totalPages !== null && page >= totalPages) {
          done = true;
        }
      }

      return collected;
    })()
      .then((list) => {
        setAllProducts(list);
        setLoadingAll(false);
        inFlight.current = null;
        return list;
      })
      .catch((err) => {
        setErrorAll(err);
        setLoadingAll(false);
        inFlight.current = null;
        throw err;
      });

    inFlight.current = fetchPromise;
    return fetchPromise;
  }, [allProducts]);

  useEffect(() => {
    prefetchAllProducts().catch(() => {});
  }, [prefetchAllProducts]);

  const value = useMemo(
    () => ({ allProducts, loadingAll, errorAll, prefetchAllProducts }),
    [allProducts, loadingAll, errorAll, prefetchAllProducts],
  );

  return (
    <ProductCacheContext.Provider value={value}>
      {children}
    </ProductCacheContext.Provider>
  );
}

export function useProductCache() {
  const ctx = useContext(ProductCacheContext);
  if (!ctx)
    throw new Error("useProductCache must be used within ProductCacheProvider");
  return ctx;
}
