import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Customer, AuthState } from '@/dto/tikiDto';


const initialState: AuthState = {
  login: {
    currentCustomer: null,
    logged: false,
    error: false,
  },
};

const authReducer = createSlice({
  name: 'authReducer',
  initialState,
  reducers: {
    loggedIn: (state, action: PayloadAction<Customer>) => {
      state.login.logged = true;
      state.login.currentCustomer = action.payload;
    },
    loggedOut: (state) => {
      state.login.logged = false;
      state.login.currentCustomer = null;
    },
  },
});

export const { loggedIn, loggedOut } = authReducer.actions;
export default authReducer.reducer;
