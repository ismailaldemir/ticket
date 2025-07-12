import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  alerts: [],
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    setAlert: {
      reducer: (state, action) => {
        state.alerts.push(action.payload);
      },
      prepare: (msg, alertType, timeout = 5000) => {
        const id = uuidv4();
        return {
          payload: {
            id,
            msg,
            alertType,
            timeout,
          },
        };
      },
    },
    removeAlert: (state, action) => {
      state.alerts = state.alerts.filter(
        (alert) => alert.id !== action.payload
      );
    },
    clearAllAlerts: (state) => {
      state.alerts = [];
    },
  },
});

export const { setAlert, removeAlert, clearAllAlerts } = alertSlice.actions;

// Middleware Thunk Functions
export const setAlertWithTimeout =
  (msg, alertType, timeout = 5000) =>
  (dispatch) => {
    const id = uuidv4();
    dispatch(setAlert(msg, alertType, timeout));

    setTimeout(() => {
      dispatch(removeAlert(id));
    }, timeout);
  };

export default alertSlice.reducer;
