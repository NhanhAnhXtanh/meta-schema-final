import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { ConfirmDeleteDialog } from './ConfirmDeleteDialog';

export function SchemaDialogs() {
    const confirmDeleteDialogIsOpen = useSelector((state: RootState) => state.ui.confirmDeleteDialog?.isOpen);

    return (
        <>
            {confirmDeleteDialogIsOpen && <ConfirmDeleteDialog />}
        </>
    );
}
