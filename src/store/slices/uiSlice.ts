import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UiState {
    sidebarOpen: boolean;
    isAddTableDialogOpen: boolean;
    confirmDeleteDialog: {
        isOpen: boolean;
        nodeId: string | null;
        fieldIndex?: number;
        fieldName?: string;
    };
}

const initialState: UiState = {
    sidebarOpen: true,
    isAddTableDialogOpen: false,
    confirmDeleteDialog: {
        isOpen: false,
        nodeId: null,
        fieldIndex: undefined,
        fieldName: undefined
    }
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
        openConfirmDeleteDialog: (state, action: PayloadAction<{ nodeId: string; fieldIndex: number; fieldName: string }>) => {
            state.confirmDeleteDialog = {
                isOpen: true,
                nodeId: action.payload.nodeId,
                fieldIndex: action.payload.fieldIndex,
                fieldName: action.payload.fieldName
            };
        },
        closeConfirmDeleteDialog: (state) => {
            state.confirmDeleteDialog = {
                isOpen: false,
                nodeId: null,
                fieldIndex: undefined,
                fieldName: undefined
            };
        },
    },
});

export const {
    toggleSidebar,
    setAddTableDialogOpen,
    openConfirmDeleteDialog, closeConfirmDeleteDialog
} = uiSlice.actions;

export default uiSlice.reducer;
