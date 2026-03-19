import React, { useEffect, useState } from "react";

// import earBud from "../../assets/banner/earBudBannerVer.png";
import laptop from "../../assets/banner/laptopBannerVer.png";
import monitor from "../../assets/banner/monitorBannerVer.png";
import phone from "../../assets/banner/phoneBannerVer.png";

export default function ProductFilterVerticalBanner({ className = "" }) {
  const images = [laptop, monitor, phone];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className={className}>
      <div className="home-vertical-banner overflow-hidden rounded-lg border border-[var(--color-border)] shadow-sm h-[520px] md:h-[560px] lg:h-[760px] flex items-center justify-center bg-[var(--color-surface)] p-0">
        <img
          src={images[index]}
          alt={`promo-${index}`}
          className="h-full w-full object-cover"
        />
      </div>
    </div>
  );
}
