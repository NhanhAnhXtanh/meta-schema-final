import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import { closeConfirmDeleteDialog } from '@/store/slices/uiSlice';
import { Trash2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { usePost } from '@/contexts/PostContext';

export function ConfirmDeleteDialog() {
    const dispatch = useDispatch();
    const post = usePost(); // Sử dụng Context để lấy post function
    const { isOpen, nodeId, fieldIndex, fieldName } = useSelector((state: RootState) => state.ui.confirmDeleteDialog);

    const handleClose = () => {
        dispatch(closeConfirmDeleteDialog());
    };

    const handleConfirm = () => {
        if (nodeId && fieldIndex !== undefined) {
            // Gửi event lên Jmix - tương tự Dashboard.tsx
            post({ 
                v: 1, 
                kind: "event", 
                type: "SCHEMA_FIELD_DELETE", 
                payload: { 
                    nodeId, 
                    fieldIndex,
                    fieldName 
                } 
            });
            
            alert(`Đã gửi yêu cầu xóa trường "${fieldName}" lên Jmix`);
        }
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <Trash2 className="w-5 h-5" />
                        Xóa trường {fieldName}?
                    </DialogTitle>
                    <DialogDescription className="py-2">
                        <span className="block font-medium text-gray-900 mb-2">
                            CẢNH BÁO CAO ĐỘ:
                        </span>
                        Hành động này sẽ xóa trường <strong>{fieldName}</strong> VÀ <strong className="text-red-600">TẤT CẢ các bảng con (descendants)</strong> được sinh ra từ trường này.
                        <br /><br />
                        Bạn có chắc chắn muốn tiếp tục không? Hành động này không thể hoàn tác.
                    </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end gap-3 mt-4">
                    <button
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
                    >
                        Xác nhận Xóa
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
