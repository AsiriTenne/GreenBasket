import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (err) {
        console.error("Error loading cart from localStorage", err);
      }
    }
  }, []);

  // Save cart to localStorage on change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        // Enforce stock limit on increment
        const newQty = Math.min(existing.quantity + quantity, product.stock);
        return prev.map(item => 
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }
      // Add new item (ensure not exceeding stock)
      const finalQty = Math.min(quantity, product.stock);
      if (finalQty <= 0) return prev; // Cannot add out of stock
      return [...prev, { product, quantity: finalQty }];
    });
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => 
      prev.map(item => {
        if (item.product.id === productId) {
          // Enforce stock limit
          const finalQty = Math.min(newQty, item.product.stock);
          return { ...item, quantity: finalQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const subtotal = parseFloat(
    cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0).toFixed(2)
  );
  const tax = parseFloat((subtotal * 0.08).toFixed(2)); // 8% Tax
  const total = parseFloat((subtotal + tax).toFixed(2));
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      subtotal,
      tax,
      total,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
