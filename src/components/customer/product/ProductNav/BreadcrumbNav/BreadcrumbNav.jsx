import React from "react";
import { getProductById } from "../../../../../services/customer/productService.js";
import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";

export default function BreadcrumbNav({ category }) {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [, setLoading] = useState(true);
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await getProductById(id);
        setProduct(res.data);
      } catch (err) {
        setProduct(null);
        console.log("Không tìm thấy sản phẩm", err);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [id]);
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
