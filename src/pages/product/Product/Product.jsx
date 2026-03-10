import { useLocation } from "react-router-dom";
import ProductLayout from "../../../components/customer/product/ProductLayout/ProductLayout.jsx";
export default function ProductList() {
  const location = useLocation();
  return <ProductLayout key={location.search} />;
}
