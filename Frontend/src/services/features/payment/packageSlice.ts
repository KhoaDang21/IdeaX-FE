import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paymentService, { type UpgradePackage } from '../payment/paymentService';

interface PackageState {
  packages: UpgradePackage[];
  loading: boolean;
  error: string | null;
}

const initialState: PackageState = {
  packages: [],
  loading: false,
  error: null,
};

// Thunk để gọi API lấy danh sách gói
export const fetchPackages = createAsyncThunk(
  'packages/fetchAll',
  async (_, thunkAPI) => {
    try {
      const data = await paymentService.fetchActivePackages();
      return data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch packages';
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

export const packageSlice = createSlice({
  name: 'package',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPackages.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPackages.fulfilled, (state, action) => {
        state.loading = false;
        state.packages = action.payload;
      })
      .addCase(fetchPackages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default packageSlice.reducer;