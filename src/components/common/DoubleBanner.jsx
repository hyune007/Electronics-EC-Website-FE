import React, { useEffect } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

import b1 from "../../assets/banner/595x100_open_iPhone 17e.png";
import b2 from "../../assets/banner/Cate_Ver4.png";
import b3 from "../../assets/banner/OPPO-reno15-cate.png";
import b4 from "../../assets/banner/OppoN6_Pre_Cate.png";
import b5 from "../../assets/banner/x8d-cate.png";
import b6 from "../../assets/banner/LG.png";

function SmallCarousel({ images, delay = 5000 }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay }),
  ]);

  useEffect(() => {
    if (!emblaApi) return;

    const onPointerUp = () => {
      const autoplay = emblaApi.plugins()?.autoplay;
      autoplay?.play?.();
    };

    emblaApi.on("pointerUp", onPointerUp);
    return () => emblaApi.off("pointerUp", onPointerUp);
  }, [emblaApi]);

  return (
    <div className="w-1/2 overflow-hidden rounded-lg border-[1px] border-[var(--color-border)] bg-[var(--color-surface)] shadow-sm">
      <div ref={emblaRef} className="h-[100px]">
        <div className="flex h-full">
          {images.map((src, i) => (
            <div key={i} className="flex-[0_0_100%] h-full">
              <a href="#" className="block h-full">
                <img
                  src={src}
                  alt={`banner-${i}`}
                  className="h-full w-full object-cover object-center"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DoubleBanner() {
  const images = [b1, b2, b3, b4, b5, b6];

  return (
    <div className="mb-6">
      <div className="w-full">
        <div className="flex gap-1">
          <SmallCarousel images={images} delay={4500} />
          <SmallCarousel images={[...images].reverse()} delay={5500} />
        </div>
      </div>
    </div>
  );
}
