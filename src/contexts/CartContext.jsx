import { createContext, useContext, useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { useAuth } from "../hooks/useAuth";
import {
  getCartByCustomer,
  createCartItem,
  updateCartItem,
  deleteCartItem,
} from "../services/customer/shoppingCartService";
import Warning from "../components/common/Warning";

const CartContext = createContext();

export function CartProvider({ children }) {
  const { user, isAuthenticated, isCustomer } = useAuth();

  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });
  const [showStockWarning, setShowStockWarning] = useState(false);

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const openStockWarning = () => {
    setShowStockWarning(true);
  };

  // đồng bộ giỏ hàng theo tài khoản nếu đã đăng nhập
  useEffect(() => {
    const syncCartFromServer = async () => {
      if (!isAuthenticated || !isCustomer || !user?.id) return;

      try {
        // giỏ hàng của guét
        const guestRaw = localStorage.getItem("cart");
        const guestCart = guestRaw ? JSON.parse(guestRaw) : [];

        const res = await getCartByCustomer(user.id);
        const rows = Array.isArray(res.data) ? res.data : [];

        if (rows.length === 0 && guestCart.length > 0) {
          // giỏ hàng của guest khi đăng nhập
          const createdItems = [];

          for (const item of guestCart) {
            try {
              const resp = await createCartItem({
                customer: { id: user.id },
                product: { id: item.id },
                quantity: item.quantity,
              });
              const saved = resp.data;
              createdItems.push({
                cartItemId: saved.id,
                id: item.id,
                name: item.name,
                price: item.discountedPrice
                  ? Number(item.discountedPrice)
                  : Number(item.price),
                quantity: item.quantity,
                image: item.image,
              });
            } catch (err) {
              const msg = err.response?.data;
              alert(msg);
            }
          }

          setCart(createdItems);
          return;
        }

        const serverCart = rows.map((row) => ({
          cartItemId: row.id,
          id: row.product.id,
          name: row.product.name,
          price: row.product.discountedPrice
            ? Number(row.product.discountedPrice)
            : Number(row.product.price),
          quantity: row.quantity,
          stock: row.product.stock,
          image: `${import.meta.env.VITE_API_BASE_URL}${row.product.image}`,
          // image: `https://ec-website-be-312564370609.asia-southeast1.run.app${row.product.image}`,
        }));

        setCart(serverCart);
      } catch (err) {
        console.error("Không thể load giỏ hàng từ server", err);
      }
    };

    syncCartFromServer();
  }, [isAuthenticated, isCustomer, user?.id]);

  const addToCart = async (product, quantity) => {
    // xem giỏ hàng đã có sản phẩm chưa
    const existingItem = cart.find((item) => item.id === product.id);
    const newQty = existingItem ? existingItem.quantity + quantity : quantity;

    if (product.stock < newQty) {
      openStockWarning();
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);

      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [
        ...prev,
        {
          id: product.id,
          name: product.name,
          price: product.discountedPrice
            ? Number(product.discountedPrice)
            : Number(product.price),
          quantity,
          stock: product.stock,
          image: `${import.meta.env.VITE_API_BASE_URL}${product.image}`,
          // image: `https://ec-website-be-312564370609.asia-southeast1.run.app${product.image}`,
          cartItemId: null,
        },
      ];
    });

    // nếu đã đăng nhập khách hàng thì lưu
    if (isAuthenticated && isCustomer && user?.id) {
      try {
        if (existingItem?.cartItemId) {
          await updateCartItem(existingItem.cartItemId, {
            id: existingItem.cartItemId,
            customer: { id: user.id },
            product: { id: product.id },
            quantity: newQty,
          });
        } else {
          const res = await createCartItem({
            customer: { id: user.id },
            product: { id: product.id },
            quantity: newQty,
          });

          const saved = res.data;
          setCart((prev) =>
            prev.map((item) =>
              item.id === product.id && item.cartItemId == null
                ? { ...item, cartItemId: saved.id }
                : item,
            ),
          );
        }
      } catch (err) {
        console.error("Không thể thêm sản phẩm vào giỏ hàng", err);
      }
    }
  };

  const removeFromCart = async (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));

    if (isAuthenticated && isCustomer && user?.id) {
      const item = cart.find((x) => x.id === id);
      if (item?.cartItemId) {
        try {
          await deleteCartItem(item.cartItemId);
        } catch (err) {
          console.error("Không thể xóa sản phẩm khỏi giỏ hàng", err);
        }
      }
    }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 1) return;

    const item = cart.find((x) => x.id === id);

    if (item && newQty > item.stock) {
      openStockWarning();
      return;
    }

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQty } : item,
      ),
    );

    if (isAuthenticated && isCustomer && user?.id) {
      if (item?.cartItemId) {
        try {
          await updateCartItem(item.cartItemId, {
            id: item.cartItemId,
            customer: { id: user.id },
            product: { id },
            quantity: newQty,
          });
        } catch (err) {
          const msg = err.response?.data;
          alert(msg);
        }
      }
    }
  };

  const clearCart = () => {
    setCart([]);
  };

  const contextValue = useMemo(
    () => ({ cart, addToCart, removeFromCart, updateQuantity, clearCart }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart],
  );

  return (
    <CartContext.Provider value={contextValue}>
      {children}

      <Warning
        open={showStockWarning}
        onClose={() => setShowStockWarning(false)}
        title="Thông báo"
        message="Số lượng sản phẩm trong giỏ vượt quá số lượng tồn kho của sản phẩm, thành thật xin lỗi bạn"
        buttonText="Đã hiểu"
      />
    </CartContext.Provider>
  );
}

CartProvider.propTypes = {
  children: PropTypes.node,
};

export const useCart = () => useContext(CartContext);
