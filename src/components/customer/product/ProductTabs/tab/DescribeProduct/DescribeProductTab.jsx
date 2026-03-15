import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
// import vi from "../../../../i18n/vi.js";
import { getProductById } from "../../../../../../services/customer/productService.js";

export default function DescribeProductTab({ product: propProduct }) {
  const { id } = useParams();
  const [product, setProduct] = useState(propProduct || null);
  const [, setLoading] = useState(!propProduct);

  useEffect(() => {
    if (propProduct) {
      setProduct(propProduct);
      return;
    }

    let mounted = true;
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await getProductById(id);
        if (mounted) setProduct(res.data);
      } catch (err) {
        if (mounted) setProduct(null);
        console.log("Không tìm thấy sản phẩm", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadProduct();
    return () => {
      mounted = false;
    };
  }, [id, propProduct]);

  return (
    <div className="max-w-none rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 lg:col-span-2 sm:p-6">
      <h3 className="mb-3 text-lg font-semibold tracking-tight text-[var(--color-text)]">
        Trải nghiệm đỉnh cao với {product?.name || "Android is the best"}
      </h3>
      <p className="leading-relaxed text-[var(--color-text-muted)]">
        {`Sở hữu công nghệ dẫn đầu xu thế, với công nghệ tuyệt vời,
thiết kế đột phá và hiệu năng mạnh mẽ, ${
          product?.name || "Android is the best"
        } mang đến trải nghiệm đỉnh cao cho người dùng trong mọi tác vụ từ giải trí đến công việc.
`}
      </p>
      <p className="mt-4 leading-relaxed text-[var(--color-text-muted)]">
        {`Hiệu năng mạnh mẽ với chip xử lý tiên tiến ${
          product?.name || "Android is the best"
        } đã được nghiên cứu và phát triển để đáp ứng mọi nhu cầu của người dùng. Với khả năng xử lý nhanh chóng và mượt mà,
         bạn có thể tận hưởng trải nghiệm giải trí đỉnh cao và làm việc hiệu quả trên thiết bị của mình.
mang đến hiệu năng vượt trội cho mọi tác vụ từ chơi game đến đa nhiệm.
Với khả năng xử lý nhanh chóng và mượt mà,
bạn có thể tận hưởng trải nghiệm giải trí đỉnh cao và làm việc hiệu quả trên thiết bị của mình.`}
      </p>
    </div>
  );
}
