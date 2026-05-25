import { createSlice } from '@reduxjs/toolkit';

const compareSlice = createSlice({
  name: 'compare',
  initialState: { ids: [] },
  reducers: {
    toggleCompare(state, action) {
      const id = action.payload;
      if (state.ids.includes(id)) {
        state.ids = state.ids.filter(i => i !== id);
      } else if (state.ids.length < 3) {
        state.ids.push(id);
      }
    },
    clearCompare(state) {
      state.ids = [];
    },
  },
});

export const { toggleCompare, clearCompare } = compareSlice.actions;
export const selectCompareIds    = state => state.compare.ids;
export const selectIsCompared    = (id) => (state) => state.compare.ids.includes(id);
export const selectCompareCount  = state => state.compare.ids.length;
export default compareSlice.reducer;
