// redux/slice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  animationComplete: false,
  position: { x: 0, y: 0, z: 0 },
  currentSection: 0,
};

const animationSlice = createSlice({
  name: 'animation',
  initialState,
  reducers: {
    setAnimationComplete(state, action) {
      state.animationComplete = action.payload;
    },
    setPosition(state, action) {
      state.position = action.payload;
    },
    setCurrentSection(state, action) {
      state.currentSection = action.payload;
    },
  },
});

export const { setAnimationComplete, setPosition, setCurrentSection } = animationSlice.actions;
export const selectAnimationState = (state) => state.animation;
export default animationSlice.reducer;
