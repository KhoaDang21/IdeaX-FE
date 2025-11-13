import { configureStore } from '@reduxjs/toolkit';
import authReducer from './services/features/auth/authSlice';
import projectReducer from "./services/features/project/projectSlice";
import ndaReducer from "./services/features/nda/ndaSlice";
import meetingReducer from "./services/features/meeting/meetingSlice";
import paymentReducer from "./services/features/payment/paymentSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    project: projectReducer,
    nda: ndaReducer,
    meeting: meetingReducer,
    payment: paymentReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
