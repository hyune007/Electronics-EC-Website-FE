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
    <nav aria-label="Breadcrumb" className="flex mb-8 text-xs text-slate-500">
      <ol className="inline-flex items-center space-x-1 md:space-x-3">
        <li>
          <a className="hover:text-primary" href="#">
            Sản phẩm
          </a>
        </li>
        <li>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
        </li>
        <li>
          {product?.category ? (
            <Link
              to={`/products?p=0&category=${product.category.id}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          ) : category ? (
            <Link
              to={`/products?p=0&category=${category.id}`}
              className="hover:text-primary"
            >
              {category.name}
            </Link>
          ) : (
            <Link to="/home" className="hover:text-primary">
              Danh mục nổi bật
            </Link>
          )}
        </li>
        <li>
          <span className="material-symbols-outlined text-xs">
            chevron_right
          </span>
        </li>
        <li className="text-slate-900 dark:text-slate-100 font-semibold">
          {product?.name || ""}
        </li>
      </ol>
    </nav>
  );
}
