import { createSlice } from "@reduxjs/toolkit";

// interface TimerState {
//     otpTimer: number;
//     isOtpTimerActive: boolean;
// }

const initialState = {
    otpTimer: 30,
    isOtpTimerActive: true,
}

const timerSlice = createSlice({
    name: "timer",
    initialState,
    reducers: {
        setOtpTimer: (state, action) => {
            state.otpTimer = action.payload;
        },
        setIsOtpTimerActive: (state, action) => {
            state.isOtpTimerActive = action.payload;
        },
        decrementTimer: (state) => {
            if (state.otpTimer > 0) {
                state.otpTimer -= 1;
            } else {
                state.isOtpTimerActive = false;
            }
        }
    }
})

export const { setOtpTimer, setIsOtpTimerActive, decrementTimer } = timerSlice.actions;
export default timerSlice.reducer;