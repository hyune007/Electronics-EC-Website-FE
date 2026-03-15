import React from "react";
import { getProductById } from "../../../../../services/customer/productService.js";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function BreadcrumbNav({
  category,
  product: propProduct,
  suppressFetch = false,
}) {
  const { id } = useParams();
  const [product, setProduct] = useState(propProduct || null);

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
      return;
    }
    if (suppressFetch || !id) return;

    let mounted = true;
    async function loadProduct() {
      try {
        const res = await getProductById(id);
        if (mounted) setProduct(res.data);
      } catch (err) {
        if (mounted) setProduct(null);
        console.log("Không tìm thấy sản phẩm", err);
      }
    }
    loadProduct();
    return () => {
      mounted = false;
    };
  }, [id, propProduct, suppressFetch]);
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-6 flex text-xs text-[var(--color-text-muted)] sm:mb-8"
    >
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li>
          <a
            className="motion-default hover:text-[var(--color-primary)]"
            href="#"
          >
            Sản phẩm
          </a>
        </li>
        <li>
          <span className="material-symbols-outlined text-xs text-[var(--color-border)]">
            chevron_right
          </span>
        </li>
        <li>
          {product?.category ? (
            <Link
              to={`/products?p=0&category=${product.category.id}`}
              className="motion-default hover:text-[var(--color-primary)]"
            >
              {product.category.name}
            </Link>
          ) : category ? (
            <Link
              to={`/products?p=0&category=${category.id}`}
              className="motion-default hover:text-[var(--color-primary)]"
            >
              {category.name}
            </Link>
          ) : (
            <Link
              to="/home"
              className="motion-default hover:text-[var(--color-primary)]"
            >
              Danh mục nổi bật
            </Link>
          )}
        </li>
        <li>
          <span className="material-symbols-outlined text-xs text-[var(--color-border)]">
            chevron_right
          </span>
        </li>
        <li className="max-w-[250px] truncate font-semibold text-[var(--color-text)] sm:max-w-[420px]">
          {product?.name || ""}
        </li>
      </ol>
    </nav>
  );
}
