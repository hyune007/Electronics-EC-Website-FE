import demoImg from "../../../../assets/demo/s23u.jpg";
export default function ProductCard() {
  return (
    <div>
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 group transform transition-transform duration-300 hover:scale-105 hover:shadow-lg cursor-pointer">
        <div className="h-44 bg-gray-50 dark:bg-gray-800 relative overflow-hidden">
          <img
            alt="Samsung Galaxy S23 Ultra 5G"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            data-alt="Samsung Galaxy S23 Ultra 5G sleek metallic design"
            src={demoImg}
          />
        </div>
        <div className="p-4">
          <p className="text-xs text-gray-400 dark:text-slate-300 uppercase font-semibold mb-1">
            Samsung
          </p>
          <h4 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors dark:text-slate-100">
            Samsung Galaxy S23 Ultra 5G (8GB/256GB)
          </h4>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-primary font-black text-sm">20.990.000₫</span>
            <span className="text-xs text-gray-400 dark:text-slate-300 line-through">
              31.990.000₫
            </span>
          </div>
          <button className="w-full py-2 bg-gray-100 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white text-gray-700 dark:text-slate-100 text-xs font-semibold rounded transition-colors">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  );
}
