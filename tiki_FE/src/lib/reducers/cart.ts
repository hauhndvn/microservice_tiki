import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/dto/tikiDto';

const initialState: CartState = {
  items: [],
};
//do truyền dữ liệu từ Form thì tất cả đều là String
export const cartReducer = createSlice({
  name: 'cartReducer',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      let isProductExist = false;
      state.items = state.items.map((item) => {
        if (item.product_id === action.payload.product_id) {
          isProductExist = true;
          return { ...item, qty: item.qty + action.payload.qty };
        }
        return item;
      });

      if (!isProductExist) {
        state.items.push(action.payload);
      }
    },
    updateCart: (state, action: PayloadAction<{ product_id: string; qty: number }>) => {
      state.items = state.items.map((item) =>
        item.product_id === Number(action.payload.product_id)
          ? { ...item, qty: Number(action.payload.qty) }
          : item
      );
    },
    deleteItemCart: (state, action: PayloadAction<{ product_id: string }>) => {
      state.items = state.items.filter((item) => item.product_id !== Number(action.payload.product_id));
    },
    resetCart: (state) => {
      state.items = [];
    },
  },
});

export const {
  addToCart,
  updateCart,
  deleteItemCart,
  resetCart,
} = cartReducer.actions;

export default cartReducer.reducer;



