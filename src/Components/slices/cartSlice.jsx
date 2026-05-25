import { createSlice } from '@reduxjs/toolkit';

const loadState = () => {
  try {
    const s = localStorage.getItem('carmart_cart');
    if (s) {
      const p = JSON.parse(s);
      if (p && Array.isArray(p.items)) return p;
    }
  } catch {}
  return { items: [], coupon: null };
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadState(),
  reducers: {
    addToCart(state, action) {
      const existing = state.items.find(i => i.id === action.payload.id);
      if (existing) {
        existing.qty += 1;
      } else {
        state.items.push({ ...action.payload, qty: 1 });
      }
    },
    removeFromCart(state, action) {
      state.items = state.items.filter(i => i.id !== action.payload);
    },
    increaseQty(state, action) {
      const item = state.items.find(i => i.id === action.payload);
      if (item) item.qty += 1;
    },
    decreaseQty(state, action) {
      const item = state.items.find(i => i.id === action.payload);
      if (item && item.qty > 1) item.qty -= 1;
    },
    clearCart(state) {
      state.items = [];
      state.coupon = null;
    },
    applyCoupon(state, action) {
      state.coupon = action.payload;   // { code: 'SAVE10', discount: 0.10 }
    },
    removeCoupon(state) {
      state.coupon = null;
    },
  },
});

export const {
  addToCart, removeFromCart,
  increaseQty, decreaseQty,
  clearCart, applyCoupon, removeCoupon,
} = cartSlice.actions;

export const selectCartItems    = state => state.cart.items;
export const selectCartCount    = state => state.cart.items.reduce((a, i) => a + i.qty, 0);
export const selectSubtotal     = state => state.cart.items.reduce((a, i) => a + i.price * i.qty, 0);
export const selectCoupon       = state => state.cart.coupon;
export const selectTotal        = state => {
  const sub  = state.cart.items.reduce((a, i) => a + i.price * i.qty, 0);
  const disc = state.cart.coupon ? sub * state.cart.coupon.discount : 0;
  return sub - disc;
};

export default cartSlice.reducer;