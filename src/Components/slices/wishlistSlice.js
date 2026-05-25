import { createSlice } from '@reduxjs/toolkit';

const load = () => {
  try {
    const s = localStorage.getItem('carmart_wishlist');
    if (s) return JSON.parse(s);
  } catch {}
  return [];
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { ids: load() },
  reducers: {
    toggleWishlist(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter(i => i !== id);
      } else {
        state.ids.push(id);
      }
    },
  },
});

export const { toggleWishlist } = wishlistSlice.actions;
export const selectWishlistIds  = state => state.wishlist.ids;
export const selectIsWishlisted = (id) => (state) => state.wishlist.ids.includes(id);
export default wishlistSlice.reducer;
