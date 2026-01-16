import { useState } from 'react';
import type { BridgeMsg } from '@/bridge/bridge-core';
import { TableNodeData } from '@/types/schema';
import { THEME } from '@/constants/theme';

export function useTableNode(
    id: string, 
    data: TableNodeData,
    post: (msg: BridgeMsg) => void
) {
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(data.label);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const headerColor = data.color || THEME.NODE.HEADER_BG_DEFAULT;

    const handleAddField = () => {
        console.log('[useTableNode] handleAddField called', { id, tableName: data.tableName, label: data.label });
        
        // Gửi event lên Jmix khi click vào "Thêm field"
        try {
            post({
                v: 1,
                kind: "event",
                type: "SCHEMA_FIELD_ADD_REQUEST",
                payload: {
                    nodeId: id,
                    tableName: data.tableName,
                    tableLabel: data.label
                }
            });
            
            alert(`Đã gửi yêu cầu mở dialog thêm field cho bảng "${data.label}" lên Jmix`);
        } catch (error) {
            console.error('[useTableNode] Error in handleAddField:', error);
            alert(`Lỗi: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const handleClone = () => {
        const newId = `table-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const payload = {
            id: newId,
            name: `${data.label} (Bản sao)`,
            tableName: data.tableName || data.label,
            columns: data.columns
        };
        
        // Gửi event lên Jmix
        post({ 
            v: 1, 
            kind: "event", 
            type: "SCHEMA_TABLE_ADD", 
            payload 
        });
        
        alert(`Đã gửi yêu cầu tạo bảng "${payload.name}" lên Jmix`);
    };

    const handleSaveRename = () => {
        if (editName.trim()) {
            const payload = { 
                id, 
                updates: { label: editName.trim() } 
            };
            
            // Gửi event lên Jmix
            post({ 
                v: 1, 
                kind: "event", 
                type: "SCHEMA_TABLE_UPDATE", 
                payload 
            });
            
            alert(`Đã gửi yêu cầu đổi tên bảng thành "${editName.trim()}" lên Jmix`);
            setIsEditing(false);
        }
    };

    return {
        isEditing,
        setIsEditing,
        editName,
        setEditName,
        showDeleteDialog,
        setShowDeleteDialog,
        headerColor,
        handleAddField,
        handleClone,
        handleSaveRename
    };
}
