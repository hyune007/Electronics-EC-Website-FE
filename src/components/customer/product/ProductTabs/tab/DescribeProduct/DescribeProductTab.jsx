import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
// import vi from "../../../../i18n/vi.js";
import { getProductById } from "../../../../../../services/customer/productService.js";

export default function DescribeProductTab() {
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
    <div className="lg:col-span-2 prose prose-slate dark:prose-invert max-w-none">
      <h3 className="text-base font-bold mb-3">
        Trải nghiệm đỉnh cao với {product?.name || "Android is the best"}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
        {`Sở hữu công nghệ dẫn đầu xu thế, với công nghệ tuyệt vời,
thiết kế đột phá và hiệu năng mạnh mẽ, ${
          product?.name || "Android is the best"
        } mang đến trải nghiệm đỉnh cao cho người dùng trong mọi tác vụ từ giải trí đến công việc.
`}
      </p>
      <br />
      <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
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
