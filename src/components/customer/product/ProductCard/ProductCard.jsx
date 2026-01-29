import demoImg from "../../../../assets/demo/s23u.jpg";
export default function ProductCard() {
  return (
    <div>
      <div className="min-w-[280px] bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 group transform transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
        <div className="h-56 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
          <img
            alt="Samsung Galaxy S23 Ultra 5G"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-alt="Samsung Galaxy S23 Ultra 5G sleek metallic design"
            src={demoImg}
          />
        </div>
        <div className="p-5">
          <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
            Samsung
          </p>
          <h4 className="font-bold text-sm mb-2 group-hover:text-primary transition-colors">
            Samsung Galaxy S23 Ultra 5G (8GB/256GB) - Hàng Chính Hãng
          </h4>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-primary font-black">20.990.000₫</span>
            <span className="text-xs text-gray-400 line-through">
              31.990.000₫
            </span>
          </div>
          <button className="w-full py-2.5 bg-gray-100 dark:bg-gray-800 group-hover:bg-primary group-hover:text-white text-gray-700 dark:text-gray-300 text-xs font-bold rounded transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
