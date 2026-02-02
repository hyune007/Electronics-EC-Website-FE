import demoImg from "../../../../assets/demo/demo.jpg";

export default function ProductCard({ product }) {
  if (!product) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <div className="h-44 bg-gray-50 dark:bg-gray-800 animate-pulse" />
        <div className="p-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3 animate-pulse" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden
                border border-gray-100 dark:border-gray-800
                group flex flex-col
                transition-transform duration-300 hover:scale-105 hover:shadow-lg"
      >
        <div className="h-44 bg-white relative overflow-hidden">
          <img
            alt={product?.name || "product"}
            className="w-full h-full py-2 object-contain
                 group-hover:scale-105 transition-transform duration-300"
            src={
              product?.image ? `http://localhost:8080${product.image}` : demoImg
            }
          />
        </div>

        <div className="p-4 flex flex-col flex-1">
          <p className="text-xs text-gray-400 dark:text-slate-300 uppercase font-semibold mb-1 min-h-[1rem]">
            {product.brand?.name || ""}
          </p>

          <h4 className="font-bold text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
            {product?.name}
          </h4>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-text-light font-black text-sm">
              {product?.price}
            </span>
            <span className="text-xs text-gray-400 line-through">
              31.990.000₫
            </span>
          </div>

          <button
            className="mt-auto w-full py-2 bg-gray-100 dark:bg-slate-800
                       group-hover:bg-primary group-hover:text-white
                       text-gray-700 dark:text-slate-100
                       text-xs font-semibold rounded transition-colors"
          >
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
