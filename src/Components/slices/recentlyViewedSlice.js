import { createSlice } from '@reduxjs/toolkit';

const recentlyViewedSlice = createSlice({
  name: 'recentlyViewed',
  initialState: { ids: [] },
  reducers: {
    viewCar(state, action) {
      const id = action.payload;
      state.ids = [id, ...state.ids.filter(i => i !== id)].slice(0, 8);
    },
  },
});

export const { viewCar } = recentlyViewedSlice.actions;
export const selectRecentlyViewed = state => state.recentlyViewed.ids;
export default recentlyViewedSlice.reducer;
