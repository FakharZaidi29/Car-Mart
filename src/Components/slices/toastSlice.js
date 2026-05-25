import { createSlice } from '@reduxjs/toolkit';

const toastSlice = createSlice({
  name: 'toast',
  initialState: { items: [] },
  reducers: {
    addToast(state, action) {
      state.items.push({ id: Date.now() + Math.random(), type: 'success', ...action.payload });
    },
    removeToast(state, action) {
      state.items = state.items.filter(t => t.id !== action.payload);
    },
  },
});

export const { addToast, removeToast } = toastSlice.actions;
export const selectToasts = state => state.toast.items;
export default toastSlice.reducer;
