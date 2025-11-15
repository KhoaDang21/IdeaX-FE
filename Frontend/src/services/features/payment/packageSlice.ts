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
      return await paymentService.fetchActivePackages(); //
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.message);
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