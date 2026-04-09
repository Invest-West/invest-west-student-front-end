import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { LOG_OUT } from '../actions/authActions';

interface JoinRequestsState {
  joinRequests: any[];
  loadingJoinRequests: boolean;
  joinRequestsLoaded: boolean;
  searchText: string;
  inSearchMode: boolean;
  matchedJoinRequests: any[];
  page: number;
  rowsPerPage: number;
}

const initialState: JoinRequestsState = {
  joinRequests: [],
  loadingJoinRequests: false,
  joinRequestsLoaded: false,
  searchText: '',
  inSearchMode: false,
  matchedJoinRequests: [],
  page: 0,
  rowsPerPage: 5,
};

const joinRequestsSlice = createSlice({
  name: 'manageJoinRequests',
  initialState,
  reducers: {
    setLoadingJoinRequests(state) {
      state.joinRequests = [];
      state.loadingJoinRequests = true;
      state.joinRequestsLoaded = false;
    },
    setJoinRequestsLoaded(state, action: PayloadAction<{ joinRequests: any[] }>) {
      state.joinRequests = action.payload.joinRequests;
      state.loadingJoinRequests = false;
      state.joinRequestsLoaded = true;
    },
    toggleSearchMode(state, action: PayloadAction<{ enter: boolean; matchedJoinRequests: any[] }>) {
      state.inSearchMode = action.payload.enter;
      state.searchText = !action.payload.enter ? '' : state.searchText;
      state.matchedJoinRequests = action.payload.matchedJoinRequests;
    },
    changePage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    changeRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
    },
    setSearchInput(
      state,
      action: PayloadAction<{ searchText: string; matchedJoinRequests: any[] }>
    ) {
      state.searchText = action.payload.searchText;
      state.matchedJoinRequests = action.payload.matchedJoinRequests;
    },
    setJoinRequestsChanged(state, action: PayloadAction<{ joinRequests: any[] }>) {
      state.joinRequests = action.payload.joinRequests;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(LOG_OUT, () => initialState);
  },
});

export const {
  setLoadingJoinRequests,
  setJoinRequestsLoaded,
  toggleSearchMode,
  changePage,
  changeRowsPerPage,
  setSearchInput,
  setJoinRequestsChanged,
} = joinRequestsSlice.actions;

export default joinRequestsSlice.reducer;
