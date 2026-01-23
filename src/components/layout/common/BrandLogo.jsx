import useTheme from "../../../hooks/useTheme";
import logo from "../../../assets/logo/UBrainTech.png";
import logoWhite from "../../../assets/logo/UBrainTech_white.png";

export default function BrandLogo() {
  const { theme } = useTheme();

  return (
    <div className="w-[190px] h-[40px] overflow-hidden">
      <img
        src={
          theme === "dark"
            ? logoWhite
            : logo
        }
        alt="UBrain Tech"
        className="w-full h-full object-cover"
      />
    </div>
  );
}
