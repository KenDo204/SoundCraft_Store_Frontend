import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import timerReducer from './slices/timerSlice';
import categoryReducer from './slices/category.slice';
import brandReducer from './slices/brand.slice';
import sliderReducer from './slices/slider.slice';
import userReducer from './slices/user.slice';
import addressReducer from './slices/address.slice';
import ghnReducer from './slices/ghn.slice';
import productReducer from './slices/product.slice';
import wishlistReducer from './slices/wishlist.slice';
import cartReducer from './slices/cart.slice';
import couponReducer from './slices/coupon.slice';
import blogReducer from './slices/blog.slice';
import preOrderReducer from './slices/pre-order.slice';
import notificationReducer from './slices/notification.slice';
import recommendationReducer from './slices/recommendation.slice';
import orderReducer from './slices/order.slice';
import revenueReducer from './slices/revenue.slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    timer: timerReducer,
    categories: categoryReducer,
    brands: brandReducer,
    sliders: sliderReducer,
    user: userReducer,
    addresses: addressReducer,
    ghn: ghnReducer,
    products: productReducer,
    wishlist: wishlistReducer,
    cart: cartReducer,
    coupon: couponReducer,
    blog: blogReducer,
    preOrder: preOrderReducer,
    notifications: notificationReducer,
    recommendations: recommendationReducer,
    orders: orderReducer,
    revenue: revenueReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;