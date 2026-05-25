import { configureStore } from '@reduxjs/toolkit';
import cartReducer     from './Components/slices/cartSlice';
import themeReducer    from './Components/slices/themeSlice';
import authReducer     from './Components/slices/authSlice';
import toastReducer    from './Components/slices/toastSlice';
import wishlistReducer from './Components/slices/wishlistSlice';
import compareReducer        from './Components/slices/compareSlice';
import recentlyViewedReducer  from './Components/slices/recentlyViewedSlice';
import carsReducer            from './Components/slices/carsSlice';

const store = configureStore({
  reducer: {
    cart:     cartReducer,
    theme:    themeReducer,
    auth:     authReducer,
    toast:    toastReducer,
    wishlist: wishlistReducer,
    compare:        compareReducer,
    recentlyViewed: recentlyViewedReducer,
    cars:           carsReducer,
  },
});

export default store;
