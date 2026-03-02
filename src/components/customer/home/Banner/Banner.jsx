import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect } from "react";
import { motion } from "framer-motion";

import Banner1 from "../../../../assets/banner/banner1.jpg";
import Banner2 from "../../../../assets/banner/banner2.jpg";
import Banner3 from "../../../../assets/banner/banner3.jpg";
import Banner4 from "../../../../assets/banner/banner4.jpg";
import Banner5 from "../../../../assets/banner/banner5.jpg";

const laptopLenovo = "https://youtu.be/0RS8KFwVXQo";
const laptopAsusRog = "https://youtu.be/NgNkCvvF4KA";
const laptopAcerNitro5 = "https://youtu.be/R4TG4evvLuY";
const iphone = "https://youtu.be/dQw4w9WgXcQ";
const samsung = "https://youtu.be/dQw4w9WgXcQ";

const banners = [Banner1, Banner2, Banner3, Banner4, Banner5];
const links = [laptopLenovo, laptopAsusRog, laptopAcerNitro5, iphone, samsung];

export default function Banner({ variant = "home" }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 4000 }),
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
    <motion.section
      layoutId="main-banner"
      transition={{
        type: "spring",
        stiffness: 80,
        damping: 20,
      }}
      className={
        variant === "home"
          ? "overflow-hidden rounded-2xl h-[48vh]"
          : "overflow-hidden h-[60vh]"
      }
    >
      <div ref={emblaRef} className="h-full">
        <div className="flex h-full">
          {banners.map((img, index) => (
            <div key={index} className="flex-[0_0_100%] h-full">
              <a
                href={links[index]}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <img
                  src={img}
                  alt={`banner-${index}`}
                  className="w-full h-full object-cover object-center bg-white dark:bg-[#181b22]"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
