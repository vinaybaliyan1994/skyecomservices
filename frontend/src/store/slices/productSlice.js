import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetch', async (params, { rejectWithValue }) => {
  try {
    const res = await productAPI.getProducts(params);
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await productAPI.getCategories();
    return res.data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: { products: [], categories: [], loading: false, error: null, pagination: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload?.data || [];
        state.pagination = action.payload ? { current_page: action.payload.current_page, last_page: action.payload.last_page, total: action.payload.total } : null;
      })
      .addCase(fetchProducts.rejected, (state, action) => { state.loading = false; state.error = action.payload?.message; })
      .addCase(fetchCategories.fulfilled, (state, action) => { state.categories = action.payload || []; });
  },
});

export default productSlice.reducer;
