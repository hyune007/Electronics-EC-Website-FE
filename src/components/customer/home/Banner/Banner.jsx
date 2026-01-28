import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { useEffect } from "react";
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

export default function Banner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 3000 }),
  ]);

  useEffect(() => {
    if (!emblaApi) return;
    const onPointerUp = () => {
      if (
        emblaApi.plugins &&
        emblaApi.plugins().autoplay &&
        emblaApi.plugins().autoplay.play
      ) {
        emblaApi.plugins().autoplay.play();
      }
    };
    emblaApi.on("pointerUp", onPointerUp);
    return () => {
      emblaApi.off("pointerUp", onPointerUp);
    };
  }, [emblaApi]);

  return (
    <section className="overflow-hidden ">
      <div ref={emblaRef}>
        <div className="flex">
          {banners.map((img, index) => (
            <div key={index} className="flex-[0_0_100%]">
              <a href={links[index]} target="_blank" rel="noopener noreferrer">
                <img
                  src={img}
                  alt={`banner-${index}`}
                  className="w-full h-full object-cover object-center bg-white dark:bg-[#181b22] mx-auto"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
