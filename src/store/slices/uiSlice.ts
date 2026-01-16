import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    sidebarOpen: boolean;
    isAddTableDialogOpen: boolean;
}

const initialState: UiState = {
    sidebarOpen: true,
    isAddTableDialogOpen: false,
};

const uiSlice = createSlice({
    name: 'ui',
    initialState,
    reducers: {
        toggleSidebar: (state) => {
            state.sidebarOpen = !state.sidebarOpen;
        },
        setAddTableDialogOpen: (state, action: PayloadAction<boolean>) => {
            state.isAddTableDialogOpen = action.payload;
        },
    },
});

export const {
    toggleSidebar,
    setAddTableDialogOpen,
} = uiSlice.actions;

export default uiSlice.reducer;
