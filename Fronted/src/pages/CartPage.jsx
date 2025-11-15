import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("cart") || "[]");
    setItems(stored);
  }, []);

  const updateQty = (id, delta) => {
    const copy = items.map((it) => (it.id === id ? { ...it, qty: Math.max(1, it.qty + delta) } : it));
    setItems(copy);
    localStorage.setItem("cart", JSON.stringify(copy));
  };

  const removeItem = (id) => {
    const copy = items.filter((it) => it.id !== id);
    setItems(copy);
    localStorage.setItem("cart", JSON.stringify(copy));
  };

  const total = items.reduce((s, it) => s + (it.price || 0) * (it.qty || 1), 0);

  const checkout = () => {
    if (items.length === 0) return alert("Cart is empty");
    // simulate checkout
    alert("Order placed! (demo)");
    localStorage.removeItem("cart");
    setItems([]);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded shadow p-6">
        <h2 className="text-2xl font-semibold mb-4">Your Cart</h2>

        {items.length === 0 ? (
          <div className="py-12 text-center text-gray-500">Your cart is empty</div>
        ) : (
          <div>
            <ul className="space-y-4">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{it.name}</div>
                    <div className="text-sm text-gray-500">₹{(it.price || 0).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQty(it.id, -1)} className="px-2">-</button>
                    <div>{it.qty}</div>
                    <button onClick={() => updateQty(it.id, 1)} className="px-2">+</button>
                    <button onClick={() => removeItem(it.id)} className="ml-4 text-red-500">Remove</button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-lg font-semibold">Total: ₹{total.toLocaleString()}</div>
              <div className="flex gap-3">
                <button onClick={() => navigate(-1)} className="px-4 py-2 border rounded">Continue shopping</button>
                <button onClick={checkout} className="px-4 py-2 bg-[#3c6e71] text-white rounded">Checkout</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
