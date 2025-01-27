// redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import animationReducer from './slice';

const store = configureStore({
  reducer: {
    animation: animationReducer,
  },
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
