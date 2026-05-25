import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api';

export const fetchCars = createAsyncThunk('cars/fetchAll', async (params, { rejectWithValue }) => {
  try {
    return await api.getCars(params);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const fetchCar = createAsyncThunk('cars/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await api.getCar(id);
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const carsSlice = createSlice({
  name: 'cars',
  initialState: {
    list:    [],
    current: null,
    total:   0,
    loading: false,
    error:   null,
  },
  reducers: {
    clearCurrent(state) { state.current = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCars.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchCars.fulfilled, (state, action) => {
        state.loading = false;
        state.list    = action.payload.cars;
        state.total   = action.payload.total;
      })
      .addCase(fetchCars.rejected,  (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      })
      .addCase(fetchCar.pending,    (state) => { state.loading = true;  state.error = null; })
      .addCase(fetchCar.fulfilled,  (state, action) => { state.loading = false; state.current = action.payload.car; })
      .addCase(fetchCar.rejected,   (state, action) => {
        state.loading = false;
        state.error   = action.payload;
      });
  },
});

export const { clearCurrent } = carsSlice.actions;
export const selectCars       = state => state.cars.list;
export const selectCar        = state => state.cars.current;
export const selectCarsLoading = state => state.cars.loading;
export const selectCarsError  = state => state.cars.error;
export default carsSlice.reducer;
