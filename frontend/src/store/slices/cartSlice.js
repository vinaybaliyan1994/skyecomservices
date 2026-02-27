import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../services/api';

export const fetchCart = createAsyncThunk('cart/fetch', async (_, { rejectWithValue }) => {
  try {
    const res = await cartAPI.getCart();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const addToCart = createAsyncThunk('cart/add', async (data, { rejectWithValue }) => {
  try {
    const res = await cartAPI.addToCart(data);
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const removeFromCart = createAsyncThunk('cart/remove', async (itemId, { rejectWithValue }) => {
  try {
    await cartAPI.removeFromCart(itemId);
    return itemId;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const updateCartItem = createAsyncThunk('cart/update', async ({ itemId, quantity }, { rejectWithValue }) => {
  try {
    const res = await cartAPI.updateCart(itemId, quantity);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], total: 0, count: 0, loading: false, error: null },
  reducers: {
    clearCartState: (state) => { state.items = []; state.total = 0; state.count = 0; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.items = action.payload.items || [];
        state.total = action.payload.total || 0;
        state.count = action.payload.count || 0;
        state.loading = false;
      })
      .addCase(fetchCart.pending, (state) => { state.loading = true; })
      .addCase(addToCart.fulfilled, (state) => { state.loading = false; })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        state.count = state.items.length;
        state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        const idx = state.items.findIndex(item => item.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
        state.total = state.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      });
  },
});

export const { clearCartState } = cartSlice.actions;
export default cartSlice.reducer;
